import os
import sys
import struct
import json
import io
from PIL import Image

def optimize_glb(input_path, output_path, max_dim=512, jpeg_quality=82):
    with open(input_path, 'rb') as f:
        magic, version, total_len = struct.unpack('<4sII', f.read(12))
        assert magic == b'glTF', "Not a GLTF file"
        
        jlen, jtype = struct.unpack('<II', f.read(8))
        assert jtype == 0x4E4F534A, "First chunk not JSON"
        json_str = f.read(jlen).decode('utf-8')
        gltf = json.loads(json_str)
        
        blen, btype = struct.unpack('<II', f.read(8))
        assert btype == 0x004E4942, "Second chunk not BIN"
        bin_data = f.read(blen)

    buffer_views = gltf.get('bufferViews', [])
    images = gltf.get('images', [])
    
    # We will reconstruct a new BIN buffer
    # Identify which bufferViews belong to images
    img_bv_indices = set(img['bufferView'] for img in images if 'bufferView' in img)
    
    # Group bufferViews into non-image and image
    # To keep simple and safe:
    # Build a map of old byteOffset/byteLength in bin_data -> new position
    new_bin = bytearray()
    
    # First, copy all non-image buffer data, keeping their relative order or packing
    # Better yet: sort all bufferViews by their original byteOffset
    sorted_bvs = sorted(range(len(buffer_views)), key=lambda i: buffer_views[i].get('byteOffset', 0))
    
    for bv_idx in sorted_bvs:
        bv = buffer_views[bv_idx]
        old_offset = bv.get('byteOffset', 0)
        old_length = bv['byteLength']
        raw_bytes = bin_data[old_offset:old_offset + old_length]
        
        # Align new_bin to 4-byte boundary
        pad = (4 - (len(new_bin) % 4)) % 4
        new_bin.extend(b'\x00' * pad)
        new_offset = len(new_bin)
        
        if bv_idx in img_bv_indices:
            # Find the corresponding image
            img_obj = next(img for img in images if img.get('bufferView') == bv_idx)
            try:
                im = Image.open(io.BytesIO(raw_bytes))
                orig_format = im.format
                
                # Resize if larger than max_dim
                w, h = im.size
                if max(w, h) > max_dim:
                    scale = max_dim / max(w, h)
                    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
                    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
                
                # Check transparency
                out_io = io.BytesIO()
                has_alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
                
                if has_alpha:
                    # Save as optimized PNG
                    im.save(out_io, format='PNG', optimize=True)
                    new_bytes = out_io.getvalue()
                    img_obj['mimeType'] = 'image/png'
                else:
                    # Save as JPEG
                    if im.mode != 'RGB':
                        im = im.convert('RGB')
                    im.save(out_io, format='JPEG', quality=jpeg_quality, optimize=True)
                    new_bytes = out_io.getvalue()
                    img_obj['mimeType'] = 'image/jpeg'
                
                # If optimized is smaller, use it, else keep original
                if len(new_bytes) < len(raw_bytes):
                    data_to_write = new_bytes
                else:
                    data_to_write = raw_bytes
            except Exception as e:
                print(f"Warning: could not optimize image in bv {bv_idx}: {e}")
                data_to_write = raw_bytes
        else:
            data_to_write = raw_bytes
            
        new_bin.extend(data_to_write)
        bv['byteOffset'] = new_offset
        bv['byteLength'] = len(data_to_write)
        
    # Align final BIN to 4 bytes
    pad = (4 - (len(new_bin) % 4)) % 4
    new_bin.extend(b'\x00' * pad)
    
    # Update gltf buffers[0] byteLength
    if 'buffers' in gltf and len(gltf['buffers']) > 0:
        gltf['buffers'][0]['byteLength'] = len(new_bin)
        
    # Re-encode JSON
    new_json_str = json.dumps(gltf, separators=(',', ':'))
    new_json_bytes = new_json_str.encode('utf-8')
    j_pad = (4 - (len(new_json_bytes) % 4)) % 4
    new_json_bytes += b' ' * j_pad
    
    new_total_len = 12 + 8 + len(new_json_bytes) + 8 + len(new_bin)
    
    with open(output_path, 'wb') as out_f:
        # Header
        out_f.write(struct.pack('<4sII', b'glTF', 2, new_total_len))
        # JSON Chunk
        out_f.write(struct.pack('<II', len(new_json_bytes), 0x4E4F534A))
        out_f.write(new_json_bytes)
        # BIN Chunk
        out_f.write(struct.pack('<II', len(new_bin), 0x004E4942))
        out_f.write(new_bin)
        
    orig_kb = os.path.getsize(input_path) // 1024
    opt_kb = os.path.getsize(output_path) // 1024
    print(f"Optimized {os.path.basename(input_path)}: {orig_kb} KB -> {opt_kb} KB ({100 - (opt_kb * 100 // orig_kb)}% reduction)")

if __name__ == '__main__':
    optimize_glb('/mnt/sdcard/Agent/UI_UX_18_11_2026/assets/models/enemy_splitter.glb',
                 '/mnt/sdcard/Agent/UI_UX_18_11_2026/assets/models/enemy_splitter_opt.glb')

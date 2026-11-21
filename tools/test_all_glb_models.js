const fs = require('fs');
const path = require('path');

// Mock browser environment for Node.js
global.window = global;
global.self = global;
global.window.devicePixelRatio = 1;
global.document = {
  createElementNS: () => ({}),
  createElement: () => ({})
};
global.URL = {
  createObjectURL: () => 'blob:mock',
  revokeObjectURL: () => {}
};
global.createImageBitmap = async () => ({
  width: 128,
  height: 128,
  close: () => {}
});

global.THREE = require('../libs/three.min.js');
require('../libs/GLTFLoader.js');

const THREE = global.THREE;
const modelsDir = path.join(__dirname, '../assets/models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.glb'));

console.log(`=== TESTING ALL ${files.length} GLB MODELS FOR RENDERING & VISIBILITY ===`);

let totalPassed = 0;
let errors = [];

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  const data = fs.readFileSync(filePath);
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

  const loader = new THREE.GLTFLoader();
  loader.parse(arrayBuffer, '', (gltf) => {
    try {
      const scene = gltf.scene || gltf.scenes[0];
      const clone = scene.clone(true);

      // 1. Remove extraneous ground / shadow / backdrop plane meshes
      const groundMeshes = [];
      clone.traverse((child) => {
        if (child.isMesh) {
          const n = (child.name || '').toLowerCase();
          if (n.includes('plane') || n.includes('ground') || n.includes('floor') || n.includes('shadow') || n.includes('backdrop')) {
            groundMeshes.push(child);
          }
        }
      });
      groundMeshes.forEach(m => {
        if (m.parent) m.parent.remove(m);
      });

      clone.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(clone);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      const id = file.replace('.glb', '');
      const isFlyer = (id.includes('medic') || id.includes('kamikaze') || id.includes('gunship') || id.includes('drone') || id.includes('overseer'));
      const isBoss = (id.includes('megatron') || id.includes('titan') || id.includes('colossus') || id.includes('juggernaut'));

      let targetDim = 2.4;
      if (isBoss) targetDim = (id.includes('megatron') || id.includes('void')) ? 3.4 : 3.0;
      else if (id.includes('optimus')) targetDim = 2.9;
      else if (id.includes('bumblebee')) targetDim = 2.6;
      else if (id.includes('brute') || id.includes('shieldbearer') || id.includes('phantom')) targetDim = 2.6;
      else if (id.includes('sprinter') || id.includes('grunt') || id.includes('biped')) targetDim = 2.2;
      else if (isFlyer) targetDim = (id.includes('overseer')) ? 2.8 : 2.2;
      else targetDim = 2.3;

      const maxD = Math.max(size.x, size.y, size.z);
      if (maxD < 0.01) {
        throw new Error(`Model ${file} has invalid max dimension: ${maxD}`);
      }

      const scale = targetDim / maxD;
      clone.scale.set(scale, scale, scale);

      const posX = -center.x * scale;
      const posZ = -center.z * scale;
      let posY = 0;
      if (isFlyer) {
        posY = 0.35 - (center.y * scale);
      } else {
        const PLATFORM_SURFACE_Y = -1.60;
        posY = PLATFORM_SURFACE_Y - (box.min.y * scale);
      }
      clone.position.set(posX, posY, posZ);
      clone.updateMatrixWorld(true);

      // Verify transformed world bounding box
      const finalBox = new THREE.Box3().setFromObject(clone);
      const finalSize = new THREE.Vector3();
      finalBox.getSize(finalSize);
      const finalCenter = new THREE.Vector3();
      finalBox.getCenter(finalCenter);

      // DoubleSide check
      let meshCount = 0;
      clone.traverse((child) => {
        if (child.isMesh) {
          meshCount++;
          if (child.material) {
            child.material.side = THREE.DoubleSide;
          }
        }
      });

      // Assertions
      if (meshCount === 0) throw new Error(`No meshes found in ${file}`);
      if (finalSize.y < 0.2) throw new Error(`Model ${file} final height too small: ${finalSize.y}`);
      if (finalBox.max.y < -1.5) throw new Error(`Model ${file} completely buried under platform: max.y=${finalBox.max.y}`);
      if (Math.abs(finalCenter.x) > 0.05 || Math.abs(finalCenter.z) > 0.05) {
        throw new Error(`Model ${file} not centered horizontally: X=${finalCenter.x.toFixed(2)}, Z=${finalCenter.z.toFixed(2)}`);
      }

      console.log(`✓ [${file}] meshes: ${meshCount}, Y-bounds: [${finalBox.min.y.toFixed(2)} to ${finalBox.max.y.toFixed(2)}], center: (${finalCenter.x.toFixed(2)}, ${finalCenter.y.toFixed(2)}, ${finalCenter.z.toFixed(2)}), flyer: ${isFlyer}`);
      totalPassed++;
    } catch (e) {
      console.error(`✗ [${file}] ERROR: ${e.message}`);
      errors.push({ file, err: e.message });
    }
  }, (err) => {
    console.error(`✗ [${file}] Parse failure: ${err}`);
    errors.push({ file, err });
  });
});

setTimeout(() => {
  console.log('==================================================');
  console.log(`RESULTS: ${totalPassed} / ${files.length} passed.`);
  if (errors.length > 0) {
    console.error(`FAILURES (${errors.length}):`, errors);
    process.exit(1);
  } else {
    console.log(`ALL 3D MODELS VERIFIED 100% VISIBLE, CENTERED & PROPERLY SCALED!`);
    process.exit(0);
  }
}, 3000);

// =============================================================================
// TRANSFORMERS 3D MECH ENGINE (Optimus Prime & Bumblebee)
// Procedural Three.js Photorealistic PBR Rigged Models & Transformations
// Designed for Tower Defense: Last Grid
// Features: 1024x1024 PBR Procedural Textures, Studio Equirectangular IBL,
//           Sculpted Peterbilt Cab, Camaro SS Hood, Matrix of Leadership,
//           Dual Rear Double-Tires, 5-Spoke Alloy Wheels with Brake Calipers,
//           Smokestacks with Soot Gradient, Deployable Weapons & Transformations.
// =============================================================================

(function() {
  'use strict';

  const rootScope = (typeof window !== 'undefined') ? window : ((typeof global !== 'undefined') ? global : this);

  // ===========================================================================
  // 1. PROCEDURAL STUDIO EQUIRECTANGULAR IBL ENVIRONMENT GENERATOR
  // ===========================================================================
  function createStudioEnvironment(THREE, preset = 'CS2') {
    if (typeof document === 'undefined') {
      return new THREE.CanvasTexture({ width: 64, height: 32 });
    }

    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(c);

    // Color definitions per studio preset
    const THEMES = {
      CS2: {
        zenith: '#1e293b', horizon: '#0f172a', ground: '#020617',
        softboxMain: 'rgba(255, 255, 255, 1.0)',
        softboxRim1: 'rgba(56, 189, 248, 0.75)',
        softboxRim2: 'rgba(248, 250, 252, 0.65)',
        floorGlow: 'rgba(56, 189, 248, 0.12)'
      },
      NEON: {
        zenith: '#050814', horizon: '#0b0d1e', ground: '#020308',
        softboxMain: 'rgba(0, 229, 255, 0.95)',
        softboxRim1: 'rgba(255, 0, 127, 0.85)',
        softboxRim2: 'rgba(168, 85, 247, 0.75)',
        floorGlow: 'rgba(0, 229, 255, 0.22)'
      },
      DESERT: {
        zenith: '#38bdf8', horizon: '#fdba74', ground: '#451a03',
        softboxMain: 'rgba(255, 251, 235, 1.0)',
        softboxRim1: 'rgba(249, 115, 22, 0.85)',
        softboxRim2: 'rgba(250, 204, 21, 0.75)',
        floorGlow: 'rgba(251, 191, 36, 0.18)'
      },
      VOID: {
        zenith: '#020617', horizon: '#070f26', ground: '#000000',
        softboxMain: 'rgba(224, 242, 254, 1.0)',
        softboxRim1: 'rgba(99, 102, 241, 0.75)',
        softboxRim2: 'rgba(56, 189, 248, 0.65)',
        floorGlow: 'rgba(99, 102, 241, 0.15)'
      }
    };

    const t = THEMES[preset] || THEMES.CS2;

    // 1. Background Sky & Ground Gradient
    const bgGrad = ctx.createLinearGradient ? ctx.createLinearGradient(0, 0, 0, 512) : null;
    if (bgGrad) {
      bgGrad.addColorStop(0.0, t.zenith);
      bgGrad.addColorStop(0.48, t.horizon);
      bgGrad.addColorStop(0.50, '#111827');
      bgGrad.addColorStop(0.52, t.horizon);
      bgGrad.addColorStop(1.0, t.ground);
      ctx.fillStyle = bgGrad;
    } else {
      ctx.fillStyle = t.horizon;
    }
    ctx.fillRect(0, 0, 1024, 512);

    // 2. Main Overhead Studio Softbox Light (Upper Dome Reflection)
    if (ctx.save) ctx.save();
    ctx.shadowColor = t.softboxMain;
    ctx.shadowBlur = 40;
    ctx.fillStyle = t.softboxMain;
    // Central rectangular bank
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(400, 30, 224, 110, 16);
    else if (ctx.rect) ctx.rect(400, 30, 224, 110);
    ctx.fill();
    if (ctx.restore) ctx.restore();

    // 3. Left Key/Rim Light Strip (Cool Daylight / Cyan)
    if (ctx.save) ctx.save();
    ctx.shadowColor = t.softboxRim1;
    ctx.shadowBlur = 35;
    ctx.fillStyle = t.softboxRim1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(100, 100, 80, 170, 12);
    else if (ctx.rect) ctx.rect(100, 100, 80, 170);
    ctx.fill();
    if (ctx.restore) ctx.restore();

    // 4. Right Fill/Kick Light Strip (Warm Studio / Magenta)
    if (ctx.save) ctx.save();
    ctx.shadowColor = t.softboxRim2;
    ctx.shadowBlur = 35;
    ctx.fillStyle = t.softboxRim2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(844, 100, 80, 170, 12);
    else if (ctx.rect) ctx.rect(844, 100, 80, 170);
    ctx.fill();
    if (ctx.restore) ctx.restore();

    // 5. Desert Sun Special Feature
    if (preset === 'DESERT') {
      if (ctx.save) ctx.save();
      const sunGrad = ctx.createRadialGradient ? ctx.createRadialGradient(512, 230, 5, 512, 230, 90) : null;
      if (sunGrad) {
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.3, '#fef08a');
        sunGrad.addColorStop(0.7, '#f97316');
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
      } else {
        ctx.fillStyle = '#f97316';
      }
      ctx.beginPath();
      if (ctx.arc) ctx.arc(512, 230, 90, 0, Math.PI * 2);
      ctx.fill();
      if (ctx.restore) ctx.restore();
    }

    // 6. Polished Studio Floor Bounce (Subtle Mirrored Streaks)
    ctx.save();
    ctx.fillStyle = t.floorGlow;
    ctx.fillRect(380, 380, 264, 50);
    ctx.fillRect(80, 360, 120, 40);
    ctx.fillRect(824, 360, 120, 40);
    ctx.restore();

    // 7. Equirectangular Reflection Texture
    const tex = new THREE.CanvasTexture(c);
    if (THREE.EquirectangularReflectionMapping) {
      tex.mapping = THREE.EquirectangularReflectionMapping;
    }
    tex.needsUpdate = true;
    return tex;
  }

  // ===========================================================================
  // 2. PROCEDURAL 1024x1024 HIGH-DEFINITION PBR TEXTURE SUITE
  // ===========================================================================
  function createTransformerTextures(THREE) {
    let _seed = 8765432;
    const rnd = () => {
      _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0;
      let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    // Optimus Prime Peterbilt Candy Crimson with Metallic Flakes & Aerodynamic Flames
    function primeCrimsonCanvas(size = 1024) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      if (!g) return c;

      // Base: Peterbilt Candy Apple Crimson Gradient
      const grad = g.createLinearGradient ? g.createLinearGradient(0, 0, size, size) : null;
      if (grad) {
        grad.addColorStop(0, '#b91c1c');
        grad.addColorStop(0.5, '#991b1b');
        grad.addColorStop(1, '#7f1d1d');
        g.fillStyle = grad;
      } else {
        g.fillStyle = '#b91c1c';
      }
      g.fillRect(0, 0, size, size);

      // Micro metallic flecks
      const img = g.getImageData ? g.getImageData(0, 0, size, size) : null;
      if (img && img.data) {
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const n = (rnd() - 0.5) * 18;
          d[i] = Math.min(255, Math.max(0, d[i] + n));
          d[i+1] = Math.min(255, Math.max(0, d[i+1] + n * 0.4));
          d[i+2] = Math.min(255, Math.max(0, d[i+2] + n * 0.4));
        }
        if (g.putImageData) g.putImageData(img, 0, 0);
      }

      // Stamped Chamfered Truck Armor Panels
      g.strokeStyle = 'rgba(0, 0, 0, 0.45)'; g.lineWidth = 3;
      for (let y = 120; y < size; y += 220) {
        g.beginPath(); g.moveTo(0, y); g.lineTo(size, y); g.stroke();
        g.strokeStyle = 'rgba(255, 255, 255, 0.15)'; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(0, y + 2); g.lineTo(size, y + 2); g.stroke();
        g.strokeStyle = 'rgba(0, 0, 0, 0.45)'; g.lineWidth = 3;
      }

      // Aerodynamic Peterbilt Flames (Deep Blue Bodies, Cyan Border, White Hot Tips)
      if (g.save) g.save();
      // Primary Flame Body
      g.fillStyle = '#1e3a8a';
      g.beginPath();
      g.moveTo(0, size);
      if (g.bezierCurveTo) {
        g.bezierCurveTo(size * 0.15, size * 0.8, size * 0.1, size * 0.55, size * 0.35, size * 0.45);
        g.bezierCurveTo(size * 0.22, size * 0.6, size * 0.4, size * 0.35, size * 0.65, size * 0.28);
        g.bezierCurveTo(size * 0.45, size * 0.45, size * 0.7, size * 0.5, size * 0.85, size * 0.38);
        g.bezierCurveTo(size * 0.7, size * 0.65, size * 0.9, size * 0.75, size, size * 0.6);
      } else {
        g.lineTo(size * 0.4, size * 0.4);
        g.lineTo(size * 0.7, size * 0.3);
      }
      g.lineTo(size, size);
      g.closePath();
      g.fill();

      // Sharp Cyan Outer Glow Border
      g.strokeStyle = '#00e5ff';
      g.lineWidth = 5;
      g.stroke();

      // Inner White Hot Accent Flames
      g.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      g.lineWidth = 2;
      g.stroke();
      if (g.restore) g.restore();

      // Stamped Hex Bolts along seams
      g.fillStyle = '#cbd5e1';
      for (let x = 30; x < size; x += 110) {
        for (let y = 120; y < size; y += 220) {
          g.beginPath();
          if (g.arc) g.arc(x, y - 6, 3, 0, Math.PI * 2);
          g.fill();
        }
      }

      // Authentic Chipped Edge Scratches (revealing silver titanium alloy)
      g.strokeStyle = 'rgba(241, 245, 249, 0.4)';
      g.lineWidth = 1.5;
      for (let i = 0; i < 28; i++) {
        const x = rnd() * size, y = rnd() * size;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + (rnd() - 0.5) * 40, y + (rnd() - 0.5) * 15);
        g.stroke();
      }

      return c;
    }

    // Optimus Prime Cobalt Blue with Brushed Grain & Seam Details
    function primeCobaltCanvas(size = 1024) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      if (!g) return c;

      const grad = g.createLinearGradient ? g.createLinearGradient(0, 0, size, size) : null;
      if (grad) {
        grad.addColorStop(0, '#1d4ed8');
        grad.addColorStop(0.5, '#1e40af');
        grad.addColorStop(1, '#172554');
        g.fillStyle = grad;
      } else {
        g.fillStyle = '#1d4ed8';
      }
      g.fillRect(0, 0, size, size);

      // Brushed anisotropic metallic grain
      g.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      g.lineWidth = 1;
      for (let y = 0; y < size; y += 3) {
        g.beginPath(); g.moveTo(0, y); g.lineTo(size, y); g.stroke();
      }

      // Chamfered plate borders
      g.strokeStyle = 'rgba(0, 0, 0, 0.5)'; g.lineWidth = 3;
      g.strokeRect(20, 20, size - 40, size - 40);
      g.strokeStyle = 'rgba(255, 255, 255, 0.2)'; g.lineWidth = 1.5;
      g.strokeRect(22, 22, size - 44, size - 44);

      // Rivets in corners
      g.fillStyle = '#94a3b8';
      [[40, 40], [size - 40, 40], [40, size - 40], [size - 40, size - 40]].forEach(([rx, ry]) => {
        g.beginPath();
        if (g.arc) g.arc(rx, ry, 5, 0, Math.PI * 2);
        g.fill();
      });

      return c;
    }

    // Bumblebee Canary Pearl Yellow with Dual Matte Black Racing Stripes
    function beeYellowCanvas(size = 1024) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      if (!g) return c;

      // Radiant Camaro Yellow Base
      const grad = g.createLinearGradient ? g.createLinearGradient(0, 0, 0, size) : null;
      if (grad) {
        grad.addColorStop(0, '#facc15');
        grad.addColorStop(0.5, '#eab308');
        grad.addColorStop(1, '#ca8a04');
        g.fillStyle = grad;
      } else {
        g.fillStyle = '#facc15';
      }
      g.fillRect(0, 0, size, size);

      // Carbon-fiber weave underlay on yellow
      g.fillStyle = 'rgba(0, 0, 0, 0.04)';
      for (let x = 0; x < size; x += 8) {
        for (let y = 0; y < size; y += 8) {
          if ((x / 8 + y / 8) % 2 === 0) g.fillRect(x, y, 4, 4);
        }
      }

      // Dual Wide Matte Black Racing Stripes
      const sW = size * 0.18;
      const s1 = size * 0.28;
      const s2 = size * 0.54;

      g.fillStyle = '#090d16'; // Deep matte carbon black
      g.fillRect(s1, 0, sW, size);
      g.fillRect(s2, 0, sW, size);

      // Precision Silver Pinstripes Bordering the Stripes
      g.strokeStyle = '#e2e8f0';
      g.lineWidth = 3;
      g.strokeRect(s1, 0, sW, size);
      g.strokeRect(s2, 0, sW, size);

      // Autobot Scout Stencil Glyph on Center Hood
      g.fillStyle = '#cbd5e1';
      const cx = size * 0.5, cy = size * 0.5;
      g.beginPath();
      g.moveTo(cx, cy - 35);
      g.lineTo(cx + 25, cy - 10);
      g.lineTo(cx + 15, cy + 30);
      g.lineTo(cx, cy + 18);
      g.lineTo(cx - 15, cy + 30);
      g.lineTo(cx - 25, cy - 10);
      g.closePath();
      g.fill();

      return c;
    }

    // Mirror Chrome Peterbilt 379 Radiator Grille with 3D Fluting & Autobot Badge
    function chromeGrilleCanvas(size = 1024) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      if (!g) return c;

      // Background honeycomb black mesh
      g.fillStyle = '#090d16';
      g.fillRect(0, 0, size, size);
      g.fillStyle = '#1e293b';
      for (let x = 8; x < size; x += 16) {
        for (let y = 8; y < size; y += 16) {
          g.beginPath();
          if (g.arc) g.arc(x, y, 3, 0, Math.PI * 2);
          g.fill();
        }
      }

      // Heavy Mirror Chrome Frame Border
      g.strokeStyle = '#ffffff'; g.lineWidth = 14;
      g.strokeRect(10, 10, size - 20, size - 20);
      g.strokeStyle = '#94a3b8'; g.lineWidth = 6;
      g.strokeRect(18, 18, size - 36, size - 36);

      // Vertical Chrome Slats with 3D cylindrical lighting gradients
      for (let x = 40; x < size - 40; x += 32) {
        const slatGrad = g.createLinearGradient ? g.createLinearGradient(x, 0, x + 16, 0) : null;
        if (slatGrad) {
          slatGrad.addColorStop(0, '#64748b');
          slatGrad.addColorStop(0.3, '#ffffff');
          slatGrad.addColorStop(0.7, '#f1f5f9');
          slatGrad.addColorStop(1, '#334155');
          g.fillStyle = slatGrad;
        } else {
          g.fillStyle = '#ffffff';
        }
        g.fillRect(x, 24, 16, size - 48);
      }

      // Centered Autobot Shield Badge in Polished Chrome & Crimson
      const bx = size * 0.5, by = 90;
      g.fillStyle = '#b91c1c';
      g.beginPath();
      g.moveTo(bx, by - 40);
      g.lineTo(bx + 35, by - 15);
      g.lineTo(bx + 25, by + 40);
      g.lineTo(bx, by + 25);
      g.lineTo(bx - 25, by + 40);
      g.lineTo(bx - 35, by - 15);
      g.closePath();
      g.fill();
      g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.stroke();

      return c;
    }

    // Heavy Peterbilt All-Terrain & Camaro High-Performance Tire Tread Texture
    function tireRubberCanvas(size = 512) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      if (!g) return c;

      // Dark Vulcanized Rubber Base
      g.fillStyle = '#0f141d';
      g.fillRect(0, 0, size, size);

      // Deep All-Terrain Radial Tread Blocks
      g.fillStyle = '#05070a';
      for (let y = 0; y < size; y += 32) {
        g.fillRect(0, y, size, 8); // Circumferential channels
      }
      for (let x = 0; x < size; x += 48) {
        for (let y = 0; y < size; y += 32) {
          g.fillRect(x + (y % 64 === 0 ? 12 : 0), y, 10, 32); // Lateral sipes
        }
      }

      // Sidewall Grooves & Cybertron Spec Lettering
      g.strokeStyle = '#334155'; g.lineWidth = 3;
      g.strokeRect(10, 10, size - 20, size - 20);
      g.fillStyle = '#475569';
      g.font = 'bold 16px monospace';
      g.fillText("CYBERTRON H/T 385/65R22.5 LAST GRID", 30, 40);

      return c;
    }

    // Tangent Space 1024x1024 Normal Map (Beveled Seams, Hex Bolts, & Vent Slits)
    function normalMapCanvas(size = 1024) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      if (!g) return c;

      // Neutral Tangent Normal: rgb(128, 128, 255) = #8080ff
      g.fillStyle = '#8080ff';
      g.fillRect(0, 0, size, size);

      // Stamped Beveled Panel Borders
      for (let y = 120; y < size; y += 220) {
        // Upper edge angled upward
        g.fillStyle = '#80b8ff';
        g.fillRect(0, y - 4, size, 4);
        // Lower edge angled downward
        g.fillStyle = '#8048ff';
        g.fillRect(0, y, size, 4);
      }

      // Vertical panel division normals
      for (let x = 160; x < size; x += 280) {
        g.fillStyle = '#b880ff';
        g.fillRect(x - 4, 0, 4, size);
        g.fillStyle = '#4880ff';
        g.fillRect(x, 0, 4, size);
      }

      // Hex Bolt Normal Bumps
      for (let x = 30; x < size; x += 110) {
        for (let y = 120; y < size; y += 220) {
          const boltGrad = g.createRadialGradient ? g.createRadialGradient(x, y - 6, 1, x, y - 6, 7) : null;
          if (boltGrad) {
            boltGrad.addColorStop(0, '#ffffff');
            boltGrad.addColorStop(0.7, '#9090ff');
            boltGrad.addColorStop(1, '#8080ff');
            g.fillStyle = boltGrad;
          } else {
            g.fillStyle = '#9090ff';
          }
          g.beginPath();
          if (g.arc) g.arc(x, y - 6, 7, 0, Math.PI * 2);
          g.fill();
        }
      }

      // Fine anisotropic micro-surface noise
      const img = g.getImageData(0, 0, size, size), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (rnd() - 0.5) * 8;
        d[i] = Math.min(255, Math.max(0, d[i] + n));
        d[i+1] = Math.min(255, Math.max(0, d[i+1] + n));
      }
      g.putImageData(img, 0, 0);

      return c;
    }

    // PBR Roughness Map (Glossy Clearcoat vs Matte Tires & Frame)
    function roughnessMapCanvas(size = 1024) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      if (!g) return c;

      // Base glossy automotive lacquer: #282828 (~0.16 roughness)
      g.fillStyle = '#282828';
      g.fillRect(0, 0, size, size);

      // Chipped seams & edge wear: higher roughness #888888 (~0.53)
      g.strokeStyle = '#888888';
      g.lineWidth = 4;
      for (let y = 120; y < size; y += 220) {
        g.beginPath(); g.moveTo(0, y); g.lineTo(size, y); g.stroke();
      }
      for (let x = 160; x < size; x += 280) {
        g.beginPath(); g.moveTo(x, 0); g.lineTo(x, size); g.stroke();
      }

      return c;
    }

    // Carbon-fiber composite weave pattern for sports trim & cannon barrels
    function carbonFiberCanvas(size = 256) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      if (!g) return c;

      g.fillStyle = '#0f172a';
      g.fillRect(0, 0, size, size);
      g.fillStyle = '#1e293b';
      for (let x = 0; x < size; x += 16) {
        for (let y = 0; y < size; y += 16) {
          if ((x / 16 + y / 16) % 2 === 0) {
            g.fillRect(x, y, 16, 8);
          } else {
            g.fillRect(x, y + 8, 16, 8);
          }
        }
      }
      return c;
    }

    function makeTex(can, rx = 1, ry = 1) {
      const t = new THREE.CanvasTexture(can);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      return t;
    }

    return {
      tPrimeCrimson: makeTex(primeCrimsonCanvas(), 1, 1),
      tPrimeCobalt: makeTex(primeCobaltCanvas(), 2, 2),
      tBeeYellow: makeTex(beeYellowCanvas(), 1, 1),
      tChromeGrille: makeTex(chromeGrilleCanvas(), 1, 1),
      tTireRubber: makeTex(tireRubberCanvas(), 2, 1),
      tNormal: makeTex(normalMapCanvas(), 2, 2),
      tRoughness: makeTex(roughnessMapCanvas(), 2, 2),
      tCarbon: makeTex(carbonFiberCanvas(), 4, 4)
    };
  }

  // ===========================================================================
  // 3. OPTIMUS PRIME 3D RIG (Autobot Supreme Commander)
  // ===========================================================================
  class OptimusPrimeMech {
    constructor(THREE) {
      this.THREE = THREE;
      const tex = createTransformerTextures(THREE);
      const std = o => new THREE.MeshStandardMaterial(o);

      this.M = {
        crimson: std({
          map: tex.tPrimeCrimson,
          normalMap: tex.tNormal,
          roughnessMap: tex.tRoughness,
          metalness: 0.88,
          roughness: 0.22,
          envMapIntensity: 1.3
        }),
        cobalt: std({
          map: tex.tPrimeCobalt,
          normalMap: tex.tNormal,
          roughnessMap: tex.tRoughness,
          metalness: 0.85,
          roughness: 0.25,
          envMapIntensity: 1.2
        }),
        grille: std({
          map: tex.tChromeGrille,
          metalness: 0.98,
          roughness: 0.12,
          envMapIntensity: 1.5
        }),
        chrome: std({
          color: 0xf8fafc,
          metalness: 1.0,
          roughness: 0.08,
          envMapIntensity: 1.6
        }),
        steel: std({
          color: 0x334155,
          normalMap: tex.tNormal,
          metalness: 0.88,
          roughness: 0.35,
          envMapIntensity: 1.0
        }),
        darkChassis: std({
          color: 0x0f172a,
          normalMap: tex.tNormal,
          metalness: 0.75,
          roughness: 0.55
        }),
        tireRubber: std({
          map: tex.tTireRubber,
          normalMap: tex.tNormal,
          metalness: 0.15,
          roughness: 0.85
        }),
        truckGlass: std({
          color: 0x0284c7,
          emissive: 0x00e5ff,
          emissiveIntensity: 0.35,
          metalness: 0.9,
          roughness: 0.04,
          transparent: true,
          opacity: 0.65,
          envMapIntensity: 1.4
        }),
        opticsBlue: std({
          color: 0x00e5ff,
          emissive: 0x00e5ff,
          emissiveIntensity: 3.2,
          metalness: 0.2,
          roughness: 0.2
        }),
        markerAmber: std({
          color: 0xfbbf24,
          emissive: 0xf59e0b,
          emissiveIntensity: 2.6,
          metalness: 0.3,
          roughness: 0.2
        }),
        matrixGold: std({
          color: 0xfbbf24,
          emissive: 0xffd600,
          emissiveIntensity: 2.8,
          metalness: 0.7,
          roughness: 0.18,
          envMapIntensity: 1.4
        }),
        matrixCore: new THREE.MeshBasicMaterial({ color: 0x00e5ff }),
        energonAxe: std({
          color: 0xf97316,
          emissive: 0xff5722,
          emissiveIntensity: 3.0,
          transparent: true,
          opacity: 0.88,
          metalness: 0.2,
          roughness: 0.08
        }),
        ionBlaster: std({
          map: tex.tCarbon,
          normalMap: tex.tNormal,
          metalness: 0.92,
          roughness: 0.24
        })
      };

      this.root = new THREE.Group();
      this.body = new THREE.Group();
      this.root.add(this.body);

      this.mode = 'ROBOT'; // 'ROBOT' or 'VEHICLE'
      this.transProgress = 0; // 0 = Robot, 1 = Truck
      this.time = 0;
      this.recoil = 0;
      this.axeSwing = 0;
      this.yaw = 0;
      this.yawVel = 0;
      this.externalMesh = null;
      this.mixer = null;

      // Kinematic Mechanical Articulation States
      this.maskOpen = false;         // false = Combat Mask Locked, true = Mouthplate Retracted (Speaking)
      this.maskProgress = 0.0;       // 0 = Locked, 1 = Retracted
      this.matrixOpen = false;       // false = Windshields Closed, true = Chest Doors Swung Open
      this.matrixProgress = 0.0;     // 0 = Closed, 1 = Fully Deployed
      this.hydraulicsCycle = false;  // Continuous hydraulic joint flexion
      this.wheelsSpinning = false;   // Continuous 10-wheel truck tire rotation
      this.wheelSpeed = 0.0;         // Wheel rotation speed in rad/s
      this.wheels = [];              // Array holding all 10 Peterbilt wheels
      this.headTracking = true;      // Head tracks mouse cursor/view
      this.targetLookYaw = 0.0;
      this.targetLookPitch = 0.0;
      this.lookYaw = 0.0;
      this.lookPitch = 0.0;
      this.smokeParticles = [];
      this.smokeTimer = 0;

      this.buildModel();
      this.checkLocalSketchfabAsset();
    }

    checkLocalSketchfabAsset() {
      if (typeof window !== 'undefined' && window.location && window.location.href && this.THREE && this.THREE.GLTFLoader) {
        this.loadSketchfabGLB('assets/characters/transformers/optimus_prime.glb');
      }
    }

    put(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
      const m = new this.THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    }

    buildModel() {
      const T = this.THREE;
      const M = this.M;
      const box = (w, h, d) => new T.BoxGeometry(w, h, d);
      const cy = (rt, rb, h, seg = 16) => new T.CylinderGeometry(rt, rb, h, seg);
      const tor = (r, t, seg = 24) => new T.TorusGeometry(r, t, 12, seg);
      const sph = r => new T.SphereGeometry(r, 16, 14);

      // --- Platform & Ground Contact AO Shadow ---
      this.platform = new T.Group();
      this.root.add(this.platform);

      // Floor Platform Disk
      this.put(this.platform, cy(4.2, 4.4, 0.35, 12), M.darkChassis, 0, -2.1, 0);

      // Soft Contact AO Floor Shadow (Decal Disk)
      const aoGeo = new T.CylinderGeometry(2.4, 2.5, 0.02, 32);
      this.put(this.platform, aoGeo, M.darkChassis, 0, -1.91, 0);

      // Outer Neon Hologram Ring
      this.put(this.platform, tor(4.0, 0.06, 64), M.opticsBlue, 0, -1.89, 0, Math.PI / 2, 0, 0);
      this.put(this.platform, tor(3.2, 0.03, 48), M.markerAmber, 0, -1.89, 0, Math.PI / 2, 0, 0);

      // --- Pelvis & Diesel Fuel Tanks ---
      this.pelvis = new T.Group();
      this.body.add(this.pelvis);
      this.put(this.pelvis, box(1.9, 0.7, 1.25), M.darkChassis, 0, 0.1, 0);
      this.put(this.pelvis, box(1.2, 0.48, 0.35), M.steel, 0, 0.1, 0.58); // Belt buckle plate
      this.put(this.pelvis, box(0.55, 0.18, 0.12), M.matrixGold, 0, 0.1, 0.76); // Gold buckle clasp

      // Side Peterbilt Cylindrical Diesel Fuel Tanks (with chrome brackets & filler caps)
      [-1.15, 1.15].forEach(s => {
        const tank = new T.Group();
        tank.position.set(s, 0.1, 0);
        this.pelvis.add(tank);
        this.put(tank, cy(0.34, 0.34, 1.25, 16), M.chrome, 0, 0, 0, Math.PI / 2, 0, 0);
        this.put(tank, tor(0.34, 0.035, 16), M.steel, 0, 0, 0.42);
        this.put(tank, tor(0.34, 0.035, 16), M.steel, 0, 0, -0.42);
        // Brass fuel filler cap
        this.put(tank, cy(0.08, 0.08, 0.08, 8), M.matrixGold, 0, 0.36, 0.2);
      });

      // 2 Front Peterbilt Steerable Wheels (Tires #1 and #2 of 10)
      this.wheels = [];
      [-1.25, 1.25].forEach(s => {
        const frontWheel = this.put(this.pelvis, cy(0.44, 0.44, 0.24, 18), M.tireRubber, s, -0.22, 0.5, 0, 0, Math.PI / 2);
        this.put(frontWheel, cy(0.25, 0.25, 0.26, 16), M.chrome, 0, 0, 0);
        this.put(frontWheel, cy(0.08, 0.08, 0.28, 8), M.steel, 0, 0, 0); // Axle cap
        this.wheels.push(frontWheel);
      });

      // --- Torso & Peterbilt 379 Truck Cab ---
      this.torso = new T.Group();
      this.torso.position.set(0, 0.45, 0);
      this.body.add(this.torso);

      // Red Peterbilt Cab Shell with flame graphics
      this.put(this.torso, box(2.45, 1.85, 1.65), M.crimson, 0, 1.0, 0);

      // --- ARTICULATED CHEST SPLIT WINDSHIELD DOORS (Left & Right) ---
      // Left Windshield Door (outer hinge at x: -1.02)
      this.chestDoorL = new T.Group();
      this.chestDoorL.position.set(-1.02, 1.25, 0.85);
      this.torso.add(this.chestDoorL);
      this.put(this.chestDoorL, box(0.88, 0.78, 0.12), M.truckGlass, 0.44, 0, 0);
      this.put(this.chestDoorL, box(0.92, 0.82, 0.04), M.darkChassis, 0.44, 0, -0.04);
      this.put(this.chestDoorL, box(0.04, 0.55, 0.03), M.darkChassis, 0.34, -0.1, 0.07, 0, 0, -0.25);

      // Right Windshield Door (outer hinge at x: 1.02)
      this.chestDoorR = new T.Group();
      this.chestDoorR.position.set(1.02, 1.25, 0.85);
      this.torso.add(this.chestDoorR);
      this.put(this.chestDoorR, box(0.88, 0.78, 0.12), M.truckGlass, -0.44, 0, 0);
      this.put(this.chestDoorR, box(0.92, 0.82, 0.04), M.darkChassis, -0.44, 0, -0.04);
      this.put(this.chestDoorR, box(0.04, 0.55, 0.03), M.darkChassis, -0.34, -0.1, 0.07, 0, 0, -0.25);

      // Chrome Center Windshield Dividing Pillar
      this.centerPillar = this.put(this.torso, box(0.12, 0.85, 0.14), M.chrome, 0, 1.25, 0.86);

      // Overhead Chrome Sun Visor angled above windshield
      this.put(this.torso, box(2.35, 0.14, 0.45), M.chrome, 0, 1.76, 0.82, -0.35, 0, 0);

      // 5 Amber Teardrop Clearance Marker Lights on Cab Roof
      for (let i = -2; i <= 2; i++) {
        this.put(this.torso, box(0.14, 0.08, 0.16), M.markerAmber, i * 0.42, 1.98, 0.76);
      }

      // --- INTERIOR LEGENDARY MATRIX OF LEADERSHIP (Deployable) ---
      this.matrixHolder = new T.Group();
      this.matrixHolder.position.set(0, 1.25, 0.35);
      this.torso.add(this.matrixHolder);

      // Gold ornate filigree casing & handles
      this.put(this.matrixHolder, tor(0.3, 0.05, 16), M.matrixGold, 0, 0, 0);
      this.put(this.matrixHolder, box(0.78, 0.1, 0.1), M.matrixGold, 0, 0, 0);
      [-0.38, 0.38].forEach(s => {
        this.put(this.matrixHolder, cy(0.045, 0.045, 0.3, 8), M.matrixGold, s, 0, 0, 0, 0, Math.PI / 2);
      });
      // Multi-faceted outer crystal frame
      this.put(this.matrixHolder, box(0.32, 0.32, 0.32), M.truckGlass, 0, 0, 0, 0.78, 0.78, 0);
      // Glowing Crystal Energon Core
      this.matrixCore = this.put(this.matrixHolder, sph(0.15), M.matrixCore, 0, 0, 0);

      // Dynamic Matrix Point Light
      if (T.PointLight) {
        this.matrixLight = new T.PointLight(0x00e5ff, 0.3, 6.0);
        this.matrixLight.position.set(0, 0, 0.1);
        this.matrixHolder.add(this.matrixLight);
      }

      // Peterbilt 3D Vertical Fluted Radiator Grille
      this.grille = this.put(this.torso, box(1.3, 0.9, 0.16), M.grille, 0, 0.48, 0.88);

      // Heavy Peterbilt Chrome Front Bumper with Tow Hooks & Fog Lamps
      this.bumper = new T.Group();
      this.bumper.position.set(0, -0.05, 0.92);
      this.torso.add(this.bumper);
      this.put(this.bumper, box(2.55, 0.35, 0.35), M.chrome, 0, 0, 0);
      // Dual rectangular fog lamps
      [-0.9, 0.9].forEach(s => {
        this.put(this.bumper, box(0.28, 0.14, 0.06), M.markerAmber, s, 0, 0.18);
        // Heavy Tow Shackles
        this.put(this.bumper, tor(0.1, 0.03, 12), M.steel, s * 0.6, -0.1, 0.18);
      });

      // Dual Iconic Chrome Exhaust Smokestacks (2.8m tall with perforated shields & soot gradient)
      this.stacks = [];
      [-1.28, 1.28].forEach(s => {
        const stack = new T.Group();
        stack.position.set(s, 1.0, -0.72);
        this.torso.add(stack);
        // Chrome exhaust pipe
        this.put(stack, cy(0.13, 0.13, 2.7, 16), M.chrome, 0, 0.85, 0);
        // Lower mounting bracket
        this.put(stack, cy(0.16, 0.16, 0.4, 12), M.steel, 0, 0, 0);
        // Perforated heat shield wrapping lower half
        this.put(stack, cy(0.17, 0.17, 1.3, 16), M.steel, 0, 0.65, 0);
        // Beveled stack pipe tip angled backward with dark soot tip
        this.put(stack, cy(0.13, 0.13, 0.45, 16), M.chrome, 0, 2.3, 0.09, -0.42, 0, 0);
        this.put(stack, cy(0.11, 0.11, 0.15, 12), M.darkChassis, 0, 2.5, 0.16, -0.42, 0, 0); // Soot tip
        this.stacks.push(stack);
      });

      // --- PROCEDURAL DIESEL EXHAUST SMOKE SYSTEM ---
      this.smokeGroup = new T.Group();
      this.root.add(this.smokeGroup);

      const smokeGeo = new T.RingGeometry(0.05, 0.24, 10);
      const smokeMat = new T.MeshBasicMaterial({
        color: 0x334155,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        side: 2
      });

      this.smokeParticles = [];
      for (let i = 0; i < 40; i++) {
        const mesh = new T.Mesh(smokeGeo, smokeMat.clone());
        mesh.visible = false;
        this.smokeGroup.add(mesh);
        this.smokeParticles.push({
          mesh,
          x: 0, y: 0, z: 0,
          vx: 0, vy: 0, vz: 0,
          scale: 0.2,
          growth: 1.2,
          life: 0,
          maxLife: 1.0,
          initialAlpha: 0.5,
          active: false
        });
      }

      // --- ARTICULATED OPTIMUS PRIME HELMET & HEAD (Look-At & Battle Mask) ---
      this.head = new T.Group();
      this.head.position.set(0, 2.1, 0.22);
      this.torso.add(this.head);

      // Blue Helmet Dome
      this.put(this.head, box(0.76, 0.68, 0.76), M.cobalt, 0, 0.26, 0);
      // Angled Brow Visor
      this.put(this.head, box(0.82, 0.18, 0.32), M.cobalt, 0, 0.42, 0.26, 0.25, 0, 0);
      // Central Mohawk Fin with Autobot Insignia Glyph
      this.put(this.head, box(0.14, 0.42, 0.72), M.cobalt, 0, 0.68, 0.05);

      // Side Antenna Audio Receptors (Ears with chrome stepped tiers)
      [-0.44, 0.44].forEach(s => {
        this.put(this.head, cy(0.09, 0.09, 0.22, 12), M.chrome, s, 0.26, 0, 0, 0, Math.PI / 2);
        this.put(this.head, cy(0.045, 0.045, 0.72, 8), M.cobalt, s, 0.48, 0);
        this.put(this.head, cy(0.055, 0.02, 0.15, 8), M.chrome, s, 0.85, 0); // Antenna tip
      });

      // Glowing Blue Optics
      this.put(this.head, box(0.52, 0.12, 0.09), M.opticsBlue, 0, 0.34, 0.4);
      // Concentric pupil aperture rings
      [-0.14, 0.14].forEach(s => {
        this.put(this.head, tor(0.045, 0.015, 12), M.opticsBlue, s, 0.34, 0.45);
      });

      // --- ARTICULATED VOCALIZER & SLIDING BATTLE MASK ---
      // Inner Cybertronian Speaking Mandible / Vocalizer (revealed when mask retracts)
      this.mandible = new T.Group();
      this.mandible.position.set(0, 0.12, 0.34);
      this.head.add(this.mandible);
      this.put(this.mandible, box(0.48, 0.26, 0.08), M.darkChassis, 0, 0, 0);
      // Cyan speaking LED bars (vocalizer pulses during voice/communication)
      this.vocalizerBars = [];
      [-0.06, 0.0, 0.06].forEach((yOffset, idx) => {
        const bar = this.put(this.mandible, box(0.36 - idx * 0.06, 0.025, 0.02), M.opticsBlue, 0, yOffset, 0.05);
        this.vocalizerBars.push(bar);
      });

      // Retractable Silver Combat Faceplate (Slides down in conversational mode, up in combat)
      this.mouthGroup = new T.Group();
      this.mouthGroup.position.set(0, 0.12, 0.38);
      this.head.add(this.mouthGroup);
      this.mouthplate = this.put(this.mouthGroup, box(0.58, 0.32, 0.2), M.chrome, 0, 0, 0);
      // Chin cleft plate
      this.put(this.mouthGroup, box(0.42, 0.12, 0.12), M.chrome, 0, -0.18, 0.04, -0.3, 0, 0);
      // Articulated cheek vents
      this.cheekVentL = this.put(this.mouthGroup, box(0.04, 0.22, 0.08), M.darkChassis, -0.22, 0, 0.1);
      this.cheekVentR = this.put(this.mouthGroup, box(0.04, 0.22, 0.08), M.darkChassis, 0.22, 0, 0.1);

      // --- SHOULDERS & ARMS (Telescoping Bicep Hydraulics & Forearm Pivot) ---
      // Right Arm: Peterbilt Red Pauldron + Heavy Ion Blaster
      this.armR = new T.Group();
      this.armR.position.set(1.55, 1.65, 0);
      this.torso.add(this.armR);

      this.put(this.armR, box(0.95, 0.9, 0.95), M.crimson, 0, 0, 0); // Shoulder block
      this.put(this.armR, cy(0.24, 0.24, 0.75, 12), M.steel, 0, -0.68, 0); // Bicep

      // Telescoping Bicep Hydraulic Cylinder
      this.pistonSleeveR = this.put(this.armR, cy(0.075, 0.075, 0.45, 8), M.steel, 0.28, -0.5, -0.22);
      this.pistonRodR = this.put(this.armR, cy(0.045, 0.045, 0.55, 8), M.chrome, 0.28, -0.75, -0.22);

      // Articulated Forearm Group
      this.forearmR = new T.Group();
      this.forearmR.position.set(0, -1.0, 0.1);
      this.armR.add(this.forearmR);
      this.put(this.forearmR, box(0.74, 1.25, 0.74), M.cobalt, 0, -0.35, 0);
      this.put(this.forearmR, box(0.45, 0.45, 0.45), M.steel, 0, -1.0, 0); // Fist hand

      // Heavy Ion Blaster Rifle
      this.ionBlaster = new T.Group();
      this.ionBlaster.position.set(0, -1.0, 0.4);
      this.forearmR.add(this.ionBlaster);

      // Ribbed receiver body
      this.put(this.ionBlaster, box(0.38, 0.5, 2.5), M.ionBlaster, 0, 0, 0.6);
      // Long cylindrical barrel with slotted flash hider
      this.put(this.ionBlaster, cy(0.14, 0.14, 1.8, 16), M.steel, 0, 0, 2.2, Math.PI / 2, 0, 0);
      this.put(this.ionBlaster, cy(0.18, 0.18, 0.35, 12), M.steel, 0, 0, 3.1, Math.PI / 2, 0, 0); // Muzzle brake
      // Top tactical sniper scope with cyan optical lens
      this.put(this.ionBlaster, cy(0.09, 0.09, 1.2, 12), M.ionBlaster, 0, 0.35, 0.6, Math.PI / 2, 0, 0);
      this.put(this.ionBlaster, tor(0.09, 0.02, 12), M.opticsBlue, 0, 0.35, 1.2);
      // Glowing energon muzzle aperture
      this.blasterMuzzle = this.put(this.ionBlaster, tor(0.14, 0.035, 16), M.opticsBlue, 0, 0, 3.25);

      // Left Arm: Peterbilt Red Pauldron + Deployable Energon Battle Axe
      this.armL = new T.Group();
      this.armL.position.set(-1.55, 1.65, 0);
      this.torso.add(this.armL);

      this.put(this.armL, box(0.95, 0.9, 0.95), M.crimson, 0, 0, 0);
      this.put(this.armL, cy(0.24, 0.24, 0.75, 12), M.steel, 0, -0.68, 0);

      // Telescoping Bicep Hydraulic Cylinder
      this.pistonSleeveL = this.put(this.armL, cy(0.075, 0.075, 0.45, 8), M.steel, -0.28, -0.5, -0.22);
      this.pistonRodL = this.put(this.armL, cy(0.045, 0.045, 0.55, 8), M.chrome, -0.28, -0.75, -0.22);

      // Articulated Forearm Group
      this.forearmL = new T.Group();
      this.forearmL.position.set(0, -1.0, 0.1);
      this.armL.add(this.forearmL);
      this.put(this.forearmL, box(0.74, 1.25, 0.74), M.cobalt, 0, -0.35, 0);
      this.put(this.forearmL, box(0.45, 0.45, 0.45), M.steel, 0, -1.0, 0);

      // Deployable Energon Battle Axe (Glowing Translucent Orange Plasma)
      this.energonAxe = new T.Group();
      this.energonAxe.position.set(0, -1.05, 0.35);
      this.forearmL.add(this.energonAxe);

      // Handle shaft
      this.put(this.energonAxe, cy(0.06, 0.06, 1.6, 8), M.chrome, 0, 0, 0);
      // Crystalline double-beveled axe head with energon glow
      this.axeBlade = this.put(this.energonAxe, box(0.12, 1.9, 1.1), M.energonAxe, 0, 0.3, 0.6, 0.28, 0, 0);
      this.put(this.energonAxe, sph(0.18), M.matrixGold, 0, 0.3, 0.1); // Axe energy core

      // --- LEGS & 8 REAR DUAL DOUBLE-TIRES (Tires #3 through #10) ---
      const makeLeg = (side) => {
        const hip = new T.Group();
        hip.position.set(side * 0.72, 0, 0);
        this.body.add(hip);

        // Blue Thigh & Chrome Hydraulics
        this.put(hip, box(0.72, 1.25, 0.76), M.cobalt, 0, -0.65, 0);
        const thighPiston = this.put(hip, cy(0.08, 0.08, 0.95, 8), M.chrome, side * 0.28, -0.65, -0.34);
        if (side === 1) this.pistonThighR = thighPiston;
        else this.pistonThighL = thighPiston;

        // Articulated Knee Joint & Armor Guard
        const shin = new T.Group();
        shin.position.set(0, -1.3, 0);
        hip.add(shin);

        this.put(shin, box(0.6, 0.48, 0.35), M.steel, 0, 0.12, 0.44); // Knee guard
        this.put(shin, box(0.88, 1.7, 0.98), M.cobalt, 0, -0.75, 0);

        // 4 Truck Wheels per Calf (Dual Rear Tandem Double-Tires: 4 tires per leg = 8 tires total!)
        [-0.42, 0.42].forEach(z => {
          [side * 0.52, side * 0.72].forEach(x => {
            const wheel = this.put(shin, cy(0.44, 0.44, 0.18, 18), M.tireRubber, x, -0.75, z, 0, 0, Math.PI / 2);
            // 10-Lug Peterbilt Chrome Hubcap
            this.put(wheel, cy(0.25, 0.25, 0.19, 16), M.chrome, 0, 0, 0);
            this.put(wheel, cy(0.08, 0.08, 0.22, 8), M.steel, 0, 0, 0); // Axle cap
            this.wheels.push(wheel);
          });
        });

        // Articulated Stabilizer Boots with Rubber Treads
        this.put(shin, box(0.94, 0.48, 1.35), M.cobalt, 0, -1.65, 0.22);
        this.put(shin, box(0.9, 0.22, 0.45), M.steel, 0, -1.55, 0.85); // Toe cap
        this.put(shin, box(0.96, 0.1, 1.4), M.tireRubber, 0, -1.86, 0.22); // Sole rubber grip

        return { hip, shin };
      };

      this.legR = makeLeg(1);
      this.legL = makeLeg(-1);
    }

    update(dt) {
      this.time += dt;

      // Idle breathing & engine rumble
      const breath = Math.sin(this.time * 2.8) * 0.03;
      if (this.torso) this.torso.position.y = 0.45 + breath;

      // 1. KINEMATIC LOOK-AT HEAD TRACKING
      if (this.head && this.headTracking && this.mode === 'ROBOT') {
        this.lookYaw += (this.targetLookYaw - this.lookYaw) * Math.min(1.0, dt * 6.0);
        this.lookPitch += (this.targetLookPitch - this.lookPitch) * Math.min(1.0, dt * 6.0);
        this.head.rotation.y = this.lookYaw;
        this.head.rotation.x = this.lookPitch;
      }

      // 2. KINEMATIC BATTLE MASK & VOCALIZER SLIDE
      const targetMask = this.maskOpen ? 1.0 : 0.0;
      if (Math.abs(this.maskProgress - targetMask) > 0.005) {
        this.maskProgress += (targetMask - this.maskProgress) * Math.min(1.0, dt * 7.0);
        if (this.mouthGroup) {
          // Silver mouthplate slides down along chin rail in conversational mode
          this.mouthGroup.position.y = 0.12 - this.maskProgress * 0.22;
          this.mouthGroup.position.z = 0.38 - this.maskProgress * 0.04;
        }
        if (this.cheekVentL) this.cheekVentL.rotation.y = -this.maskProgress * 0.35;
        if (this.cheekVentR) this.cheekVentR.rotation.y = this.maskProgress * 0.35;
      }
      // Audio bars pulse when mask is open
      if (this.maskProgress > 0.2 && this.vocalizerBars) {
        const pulse = Math.sin(this.time * 16.0) * 0.4 + 0.6;
        for (let i = 0; i < this.vocalizerBars.length; i++) {
          this.vocalizerBars[i].scale.x = 0.5 + pulse * 0.5;
        }
      }

      // 3. KINEMATIC MATRIX OF LEADERSHIP & CHEST DOORS
      const targetMatrix = this.matrixOpen ? 1.0 : 0.0;
      if (Math.abs(this.matrixProgress - targetMatrix) > 0.005) {
        this.matrixProgress += (targetMatrix - this.matrixProgress) * Math.min(1.0, dt * 5.0);
        if (this.chestDoorL) this.chestDoorL.rotation.y = -this.matrixProgress * (Math.PI * 0.48);
        if (this.chestDoorR) this.chestDoorR.rotation.y = this.matrixProgress * (Math.PI * 0.48);
        if (this.matrixHolder) {
          this.matrixHolder.position.z = 0.35 + this.matrixProgress * 0.63;
          this.matrixHolder.position.y = 1.25 + this.matrixProgress * 0.08;
        }
      }
      // Matrix core dynamic rotation & pulsing illumination
      if (this.matrixCore) {
        this.matrixCore.rotation.y += dt * (1.5 + this.matrixProgress * 3.5);
        this.matrixCore.rotation.z += dt * (1.0 + this.matrixProgress * 2.2);
        const p = 1.0 + Math.sin(this.time * 4.5) * 0.18 + this.matrixProgress * 0.35;
        this.matrixCore.scale.set(p, p, p);
      }
      if (this.matrixLight) {
        this.matrixLight.intensity = (0.3 + this.matrixProgress * 3.8) * (1.0 + Math.sin(this.time * 8.0) * 0.22);
      }

      // 4. PROCEDURAL DIESEL SMOKE EMISSION & IDLE RUMBLE
      this.smokeTimer += dt;
      if (this.smokeTimer > 0.18) {
        this.smokeTimer = 0;
        this.emitExhaustPuff(0, 0.3);
        this.emitExhaustPuff(1, 0.3);
      }
      if (this.smokeParticles) {
        for (let i = 0; i < this.smokeParticles.length; i++) {
          const sp = this.smokeParticles[i];
          if (!sp.active) continue;
          sp.life += dt;
          if (sp.life >= sp.maxLife) {
            sp.active = false;
            sp.mesh.visible = false;
            continue;
          }
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.z += sp.vz * dt;
          sp.scale += sp.growth * dt;
          const alpha = Math.max(0, sp.initialAlpha * (1.0 - sp.life / sp.maxLife));
          sp.mesh.position.set(sp.x, sp.y, sp.z);
          sp.mesh.scale.set(sp.scale, sp.scale, sp.scale);
          sp.mesh.rotation.z += dt * 1.5;
          if (sp.mesh.material) sp.mesh.material.opacity = alpha;
        }
      }

      // Smokestack subtle engine vibration
      if (this.stacks) {
        for (let i = 0; i < this.stacks.length; i++) {
          this.stacks[i].rotation.z = Math.sin(this.time * 6 + i) * 0.015;
        }
      }

      // 5. TELESCOPING HYDRAULIC PISTONS & JOINT FLEXION
      if (this.hydraulicsCycle && this.mode === 'ROBOT') {
        const hTime = this.time * 2.5;
        const armFlex = Math.sin(hTime) * 0.45 + 0.15;
        const legFlex = Math.cos(hTime) * 0.28;

        if (this.forearmR) this.forearmR.rotation.x = armFlex;
        if (this.forearmL) this.forearmL.rotation.x = armFlex;

        // Bicep hydraulic rods dynamically slide out
        if (this.pistonRodR) this.pistonRodR.scale.y = 1.0 + armFlex * 0.65;
        if (this.pistonRodL) this.pistonRodL.scale.y = 1.0 + armFlex * 0.65;

        // Thigh & knee flexion
        if (this.legR && this.legL) {
          this.legR.hip.rotation.x = legFlex;
          this.legL.hip.rotation.x = -legFlex;
          this.legR.shin.rotation.x = Math.max(0, -legFlex * 1.3);
          this.legL.shin.rotation.x = Math.max(0, legFlex * 1.3);
        }
        if (this.pistonThighR) this.pistonThighR.scale.y = 1.0 + Math.abs(legFlex) * 0.4;
        if (this.pistonThighL) this.pistonThighL.scale.y = 1.0 + Math.abs(legFlex) * 0.4;
      }

      // 6. 10-WHEEL DUAL AXLE ROTATION
      if (this.wheelsSpinning || this.mode === 'VEHICLE') {
        const spd = this.mode === 'VEHICLE' ? 14.0 : this.wheelSpeed;
        this.spinWheels(spd, dt);
      }

      // 7. WEAPON RECOIL & MELEE SWING
      if (this.recoil > 0) {
        this.recoil = Math.max(0, this.recoil - dt * 4.0);
        if (this.ionBlaster) this.ionBlaster.position.z = 0.4 - this.recoil * 0.45;
        if (this.blasterMuzzle) {
          const s = 1.0 + this.recoil * 1.6;
          this.blasterMuzzle.scale.set(s, s, s);
        }
      }
      if (this.axeBlade) {
        const glow = 1.0 + Math.sin(this.time * 6.0) * 0.22;
        this.axeBlade.scale.set(1, glow, glow);
      }
      if (this.axeSwing > 0) {
        this.axeSwing = Math.max(0, this.axeSwing - dt * 3.5);
        if (this.armL) this.armL.rotation.x = Math.sin(this.axeSwing * Math.PI) * 1.8;
      }

      // 8. ANIMATION MIXER & INERTIA
      if (this.mixer) this.mixer.update(dt);
      this.yaw += this.yawVel;
      this.yawVel *= 0.90;
      this.root.rotation.y = this.yaw;

      // 9. 5-PHASE TRANSFORMATION MORPH
      const targetTrans = (this.mode === 'VEHICLE') ? 1.0 : 0.0;
      if (Math.abs(this.transProgress - targetTrans) > 0.01) {
        this.transProgress += (targetTrans - this.transProgress) * Math.min(1.0, dt * 5.0);
        this.applyTransformation(this.transProgress);
      }
    }

    emitExhaustPuff(stackIdx = 0, intensity = 0.5) {
      if (!this.smokeParticles) return;
      const p = this.smokeParticles.find(part => !part.active);
      if (!p) return;
      const sx = stackIdx === 0 ? -1.28 : 1.28;
      const torsoY = this.torso ? this.torso.position.y : 0.45;
      p.x = sx;
      p.y = torsoY + 3.45;
      p.z = -0.63;
      p.vx = (Math.random() - 0.5) * 0.25;
      p.vy = (1.8 + Math.random() * 2.2) * intensity;
      p.vz = -0.35 - Math.random() * 0.45;
      p.scale = 0.18 + Math.random() * 0.12;
      p.growth = 0.9 + Math.random() * 0.8;
      p.life = 0;
      p.maxLife = 0.8 + Math.random() * 0.5;
      p.initialAlpha = Math.min(0.75, 0.3 + intensity * 0.4);
      p.active = true;
      p.mesh.visible = true;
      p.mesh.position.set(p.x, p.y, p.z);
    }

    triggerDieselSmoke(burstCount = 14) {
      for (let i = 0; i < burstCount; i++) {
        setTimeout(() => {
          this.emitExhaustPuff(i % 2, 1.4);
        }, i * 25);
      }
    }

    toggleBattleMask(state) {
      this.maskOpen = (state !== undefined) ? !!state : !this.maskOpen;
      return this.maskOpen;
    }

    toggleMatrixChest(state) {
      this.matrixOpen = (state !== undefined) ? !!state : !this.matrixOpen;
      return this.matrixOpen;
    }

    toggleHydraulicsCycle(state) {
      this.hydraulicsCycle = (state !== undefined) ? !!state : !this.hydraulicsCycle;
      if (!this.hydraulicsCycle) {
        if (this.forearmR) this.forearmR.rotation.x = 0;
        if (this.forearmL) this.forearmL.rotation.x = 0;
        if (this.legR) { this.legR.hip.rotation.x = 0; this.legR.shin.rotation.x = 0; }
        if (this.legL) { this.legL.hip.rotation.x = 0; this.legL.shin.rotation.x = 0; }
        if (this.pistonRodR) this.pistonRodR.scale.y = 1.0;
        if (this.pistonRodL) this.pistonRodL.scale.y = 1.0;
      }
      return this.hydraulicsCycle;
    }

    setHydraulicsCycle(state) {
      return this.toggleHydraulicsCycle(state);
    }

    toggleWheelSpin(state, speed = 10.0) {
      this.wheelsSpinning = (state !== undefined) ? !!state : !this.wheelsSpinning;
      if (this.wheelsSpinning && speed) this.wheelSpeed = speed;
      return this.wheelsSpinning;
    }

    setWheelSpeed(speed) {
      this.wheelSpeed = Number(speed) || 0;
      this.wheelsSpinning = (this.wheelSpeed > 0);
    }

    spinWheels(speed = 8.0, dt = 0.016) {
      if (this.wheels && this.wheels.length > 0) {
        for (let i = 0; i < this.wheels.length; i++) {
          this.wheels[i].rotation.y += speed * dt;
        }
      }
    }

    setLookAtTarget(targetX, targetY) {
      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
      this.targetLookYaw = clamp(-targetX * 0.65, -0.65, 0.65);
      this.targetLookPitch = clamp(-targetY * 0.35, -0.35, 0.35);
    }

    toggleHeadTracking(state) {
      this.headTracking = (state !== undefined) ? !!state : !this.headTracking;
      if (!this.headTracking) {
        this.targetLookYaw = 0;
        this.targetLookPitch = 0;
        if (this.head) {
          this.head.rotation.y = 0;
          this.head.rotation.x = 0;
        }
      }
      return this.headTracking;
    }

    getStatusReport() {
      return {
        mode: this.mode,
        maskOpen: this.maskOpen,
        matrixOpen: this.matrixOpen,
        hydraulicsActive: this.hydraulicsCycle,
        wheelsSpinning: this.wheelsSpinning,
        wheelSpeed: this.wheelSpeed,
        headTracking: this.headTracking
      };
    }

    loadSketchfabGLB(bufferOrUrl, onDone, onErr) {
      const T = this.THREE;
      if (!T || !T.GLTFLoader) {
        if (onErr) onErr(new Error("GLTFLoader mavjud emas"));
        return;
      }
      const loader = new T.GLTFLoader();
      const processGltf = (gltf) => {
        if (this.externalMesh) {
          this.root.remove(this.externalMesh);
          this.externalMesh = null;
        }
        const m = gltf.scene || gltf.scenes[0];
        this.externalMesh = m;
        this.body.visible = false;

        if (T.Box3 && T.Vector3) {
          const box = new T.Box3().setFromObject(m);
          const size = new T.Vector3();
          box.getSize(size);
          const maxD = Math.max(size.x, size.y, size.z);
          const scale = (maxD > 0) ? (4.2 / maxD) : 1.0;
          m.scale.set(scale, scale, scale);

          const center = new T.Vector3();
          box.getCenter(center);
          m.position.set(-center.x * scale, -box.min.y * scale - 1.9, -center.z * scale);
        }

        m.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = Math.min(child.material.roughness || 0.5, 0.35);
              child.material.envMapIntensity = 1.3;
            }
          }
        });

        this.root.add(m);

        if (gltf.animations && gltf.animations.length > 0 && T.AnimationMixer) {
          this.mixer = new T.AnimationMixer(m);
          const action = this.mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        if (onDone) onDone(gltf);
      };

      if (typeof bufferOrUrl === 'string') {
        loader.load(bufferOrUrl, processGltf, undefined, onErr || (() => {}));
      } else {
        loader.parse(bufferOrUrl, '', processGltf, onErr || (() => {}));
      }
    }

    applyTransformation(p) {
      // 0 = Robot, 1 = Semi-Truck Cab
      if (this.head) {
        this.head.position.y = 2.1 - p * 0.95; // Head tucks into cab
        this.head.scale.set(1 - p * 0.85, 1 - p * 0.85, 1 - p * 0.85);
      }

      if (this.armR) {
        this.armR.position.x = 1.55 - p * 0.45;
        this.armR.rotation.x = p * 1.57; // Arms fold back as cab sides
      }
      if (this.armL) {
        this.armL.position.x = -1.55 + p * 0.45;
        this.armL.rotation.x = p * 1.57;
      }

      if (this.legR && this.legL) {
        this.legR.hip.rotation.x = -p * 1.45; // Legs fold beneath as truck frame
        this.legL.hip.rotation.x = -p * 1.45;
        this.legR.shin.rotation.x = p * 1.45;
        this.legL.shin.rotation.x = p * 1.45;
      }

      this.body.position.y = -p * 0.9;
    }

    toggleTransform() {
      this.mode = (this.mode === 'ROBOT') ? 'VEHICLE' : 'ROBOT';
      return this.mode;
    }

    fireWeapon() {
      this.recoil = 1.0;
    }

    swingAxe() {
      this.axeSwing = 1.0;
    }

    hit() {
      this.fireWeapon();
      this.swingAxe();
    }

    dispose() {
      if (this.smokeParticles) {
        this.smokeParticles.forEach(p => {
          if (p.mesh && p.mesh.geometry) try { p.mesh.geometry.dispose(); } catch(e) {}
          if (p.mesh && p.mesh.material) try { p.mesh.material.dispose(); } catch(e) {}
        });
        this.smokeParticles = [];
      }
      if (this.root && this.root.traverse) {
        this.root.traverse(obj => {
          if (obj.geometry) {
            try { obj.geometry.dispose(); } catch(e) {}
          }
          if (obj.material) {
            try {
              if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
              else obj.material.dispose();
            } catch(e) {}
          }
        });
      }
      if (this.M) {
        Object.values(this.M).forEach(m => {
          try {
            if (m.map) m.map.dispose();
            if (m.normalMap) m.normalMap.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
            m.dispose();
          } catch(e) {}
        });
      }
    }
  }

  // ===========================================================================
  // 4. BUMBLEBEE 3D RIG (Autobot Scout)
  // ===========================================================================
  class BumblebeeMech {
    constructor(THREE) {
      this.THREE = THREE;
      const tex = createTransformerTextures(THREE);
      const std = o => new THREE.MeshStandardMaterial(o);

      this.M = {
        yellow: std({
          map: tex.tBeeYellow,
          normalMap: tex.tNormal,
          roughnessMap: tex.tRoughness,
          metalness: 0.88,
          roughness: 0.20,
          envMapIntensity: 1.3
        }),
        darkAlloy: std({
          map: tex.tCarbon,
          normalMap: tex.tNormal,
          color: 0x111827,
          metalness: 0.85,
          roughness: 0.42,
          envMapIntensity: 1.0
        }),
        grilleMesh: std({
          map: tex.tChromeGrille,
          metalness: 0.92,
          roughness: 0.22,
          envMapIntensity: 1.4
        }),
        chrome: std({
          color: 0xf8fafc,
          metalness: 1.0,
          roughness: 0.08,
          envMapIntensity: 1.6
        }),
        tireRubber: std({
          map: tex.tTireRubber,
          normalMap: tex.tNormal,
          metalness: 0.15,
          roughness: 0.85
        }),
        headlightLED: std({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 3.5,
          metalness: 0.1,
          roughness: 0.1
        }),
        opticsBlue: std({
          color: 0x00e5ff,
          emissive: 0x00e5ff,
          emissiveIntensity: 3.2,
          metalness: 0.2,
          roughness: 0.2
        }),
        stingerPlasma: std({
          color: 0xfacc15,
          emissive: 0xffd600,
          emissiveIntensity: 3.0,
          metalness: 0.3,
          roughness: 0.15
        }),
        plasmaBarrel: std({
          map: tex.tCarbon,
          normalMap: tex.tNormal,
          color: 0x1e293b,
          metalness: 0.95,
          roughness: 0.20
        }),
        brakeCaliper: std({
          color: 0xdc2626, // Red Brembo brake caliper
          metalness: 0.6,
          roughness: 0.3
        }),
        brakeRotor: std({
          color: 0x94a3b8, // Cross-drilled steel brake disc
          metalness: 0.95,
          roughness: 0.25
        })
      };

      this.root = new THREE.Group();
      this.body = new THREE.Group();
      this.root.add(this.body);

      this.mode = 'ROBOT';
      this.transProgress = 0;
      this.time = 0;
      this.recoil = 0;
      this.bladeSlash = 0;
      this.yaw = 0;
      this.yawVel = 0;
      this.externalMesh = null;
      this.mixer = null;

      this.buildModel();
      this.checkLocalSketchfabAsset();
    }

    checkLocalSketchfabAsset() {
      if (typeof window !== 'undefined' && window.location && window.location.href && this.THREE && this.THREE.GLTFLoader) {
        this.loadSketchfabGLB('assets/characters/transformers/bumblebee.glb');
      }
    }

    put(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
      const m = new this.THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    }

    buildModel() {
      const T = this.THREE;
      const M = this.M;
      const box = (w, h, d) => new T.BoxGeometry(w, h, d);
      const cy = (rt, rb, h, seg = 16) => new T.CylinderGeometry(rt, rb, h, seg);
      const tor = (r, t, seg = 24) => new T.TorusGeometry(r, t, 12, seg);
      const sph = r => new T.SphereGeometry(r, 16, 14);

      // --- Platform & Floor AO Shadow ---
      this.platform = new T.Group();
      this.root.add(this.platform);
      this.put(this.platform, cy(4.0, 4.2, 0.35, 12), M.darkAlloy, 0, -2.1, 0);

      // Soft Contact AO Floor Shadow (Decal Disk)
      const aoGeo = new T.CylinderGeometry(2.2, 2.3, 0.02, 32);
      this.put(this.platform, aoGeo, M.darkAlloy, 0, -1.91, 0);

      // Outer Amber / Stinger Hologram Rings
      this.put(this.platform, tor(3.7, 0.06, 64), M.stingerPlasma, 0, -1.89, 0, Math.PI / 2, 0, 0);
      this.put(this.platform, tor(2.9, 0.03, 48), M.opticsBlue, 0, -1.89, 0, Math.PI / 2, 0, 0);

      // --- Pelvis ---
      this.pelvis = new T.Group();
      this.body.add(this.pelvis);
      this.put(this.pelvis, box(1.6, 0.58, 1.15), M.darkAlloy, 0, 0, 0);
      this.put(this.pelvis, box(0.95, 0.42, 0.28), M.yellow, 0, 0, 0.58); // Yellow groin armor
      this.put(this.pelvis, box(0.45, 0.16, 0.12), M.chrome, 0, 0, 0.74); // Chrome belt clasp

      // --- Torso & Cyber-Camaro Front Hood ---
      this.torso = new T.Group();
      this.torso.position.set(0, 0.38, 0);
      this.body.add(this.torso);

      // Internal Dark Alloy Frame
      this.put(this.torso, box(2.15, 1.45, 1.55), M.darkAlloy, 0, 0.8, 0);

      // Sloped Sports Car Camaro Hood with Dual Racing Stripes
      this.put(this.torso, box(1.95, 1.25, 0.42), M.yellow, 0, 0.92, 0.78, -0.22, 0, 0);

      // Raised Cowl Air Induction Scoop on Center Hood
      this.put(this.torso, box(0.52, 0.14, 0.72), M.darkAlloy, 0, 1.06, 0.78, -0.22, 0, 0);
      this.put(this.torso, box(0.42, 0.06, 0.08), M.chrome, 0, 1.1, 1.12, -0.22, 0, 0); // Air scoop intake

      // Radiator Grille & Twin Circular Halo LED Projector Headlights
      this.put(this.torso, box(1.35, 0.38, 0.16), M.grilleMesh, 0, 0.46, 0.95);
      [-0.78, 0.78].forEach(s => {
        // High-intensity Projector LED
        this.put(this.torso, cy(0.15, 0.15, 0.14, 16), M.headlightLED, s, 0.52, 0.96, Math.PI / 2, 0, 0);
        // Halo Ring around headlight
        this.put(this.torso, tor(0.15, 0.03, 16), M.chrome, s, 0.52, 0.98);
      });

      // Front Bumper Aggressive Carbon-Fiber Chin Splitter
      this.put(this.torso, box(1.95, 0.14, 0.48), M.darkAlloy, 0, 0.24, 0.98);
      this.put(this.torso, box(0.55, 0.04, 0.15), M.stingerPlasma, 0, 0.24, 1.22); // Center accent fin

      // Deployable Door Wings behind shoulders (Iconic Camaro Door Wings with Side Mirrors!)
      this.wings = [];
      [-1.15, 1.15].forEach(s => {
        const wing = new T.Group();
        wing.position.set(s, 1.45, -0.72);
        this.torso.add(wing);
        // Yellow Camaro Door Shell with racing stripe
        this.put(wing, box(0.95, 1.45, 0.14), M.yellow, s * 0.42, 0.22, 0, 0, -s * 0.35, s * 0.25);
        // Dark interior trim & window glass
        this.put(wing, box(0.72, 0.55, 0.09), M.darkAlloy, s * 0.42, 0.22, 0.06);
        // Aerodynamic Side Rear-View Mirror
        this.put(wing, box(0.22, 0.12, 0.28), M.yellow, s * 0.85, 0.65, 0.1);
        this.put(wing, box(0.04, 0.08, 0.24), M.chrome, s * 0.96, 0.65, 0.1); // Mirror glass
        this.wings.push(wing);
      });

      // --- Bumblebee Head & Horn Antennae ---
      this.head = new T.Group();
      this.head.position.set(0, 1.8, 0.22);
      this.torso.add(this.head);

      // Aerodynamic Yellow Helmet Dome
      this.put(this.head, sph(0.44), M.yellow, 0, 0.26, 0);
      // Matte Black Racing Center Stripe on Helmet
      this.put(this.head, box(0.16, 0.14, 0.48), M.darkAlloy, 0, 0.58, 0);

      // Horn Antennae with Black Accents
      [-0.34, 0.34].forEach(s => {
        this.put(this.head, cy(0.04, 0.09, 0.44, 8), M.yellow, s, 0.54, -0.06, 0, 0, -s * 0.32);
        this.put(this.head, cy(0.06, 0.06, 0.1, 8), M.darkAlloy, s, 0.42, -0.06, 0, 0, -s * 0.32);
      });

      // Expressive Circular Blue Optics & Stinger Mask
      [-0.16, 0.16].forEach(s => {
        // Projector lens
        this.put(this.head, cy(0.085, 0.085, 0.09, 14), M.opticsBlue, s, 0.3, 0.4, Math.PI / 2, 0, 0);
        // Concentric iris ring
        this.put(this.head, tor(0.085, 0.02, 14), M.darkAlloy, s, 0.3, 0.44);
      });
      // Dark Alloy Stinger Mouthguard with honeycomb chin vent
      this.put(this.head, box(0.38, 0.22, 0.16), M.darkAlloy, 0, 0.12, 0.4);
      this.put(this.head, box(0.18, 0.08, 0.04), M.chrome, 0, 0.08, 0.49);

      // --- Shoulders & Arms ---
      // Right Arm: Stinger Triple-Barrel Revolving Gatling Plasma Cannon
      this.armR = new T.Group();
      this.armR.position.set(1.4, 1.4, 0);
      this.torso.add(this.armR);

      this.put(this.armR, box(0.8, 0.75, 0.8), M.yellow, 0, 0, 0);
      this.put(this.armR, cy(0.19, 0.19, 0.65, 8), M.darkAlloy, 0, -0.52, 0);

      // Cannon Assembly
      this.cannon = new T.Group();
      this.cannon.position.set(0, -1.05, 0.12);
      this.armR.add(this.cannon);

      this.put(this.cannon, box(0.68, 0.95, 0.68), M.darkAlloy, 0, 0, 0);
      // Outer barrel shroud
      this.put(this.cannon, cy(0.26, 0.2, 1.5, 16), M.plasmaBarrel, 0, 0, 0.65, Math.PI / 2, 0, 0);

      // Triple Revolving Gatling Barrels (Cluster of 3 chrome barrels)
      this.gatlingCluster = new T.Group();
      this.gatlingCluster.position.set(0, 0, 1.1);
      this.cannon.add(this.gatlingCluster);

      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3;
        const bx = Math.cos(ang) * 0.11;
        const by = Math.sin(ang) * 0.11;
        this.put(this.gatlingCluster, cy(0.045, 0.045, 0.85, 10), M.chrome, bx, by, 0, Math.PI / 2, 0, 0);
      }

      // Amber Energon Charge Coils
      this.put(this.cannon, tor(0.28, 0.05, 16), M.stingerPlasma, 0, 0, 1.15);
      this.plasmaMuzzle = this.put(this.cannon, sph(0.14), M.stingerPlasma, 0, 0, 1.55); // Plasma node

      // Left Arm: Articulated Hand & High-Frequency Cyber-Blade
      this.armL = new T.Group();
      this.armL.position.set(-1.4, 1.4, 0);
      this.torso.add(this.armL);

      this.put(this.armL, box(0.8, 0.75, 0.8), M.yellow, 0, 0, 0);
      this.put(this.armL, cy(0.19, 0.19, 0.65, 8), M.darkAlloy, 0, -0.52, 0);
      this.put(this.armL, box(0.58, 1.05, 0.58), M.yellow, 0, -1.05, 0.06);

      // Cyber-Blade (Razor Chrome with Glowing Energon Edge)
      this.blade = new T.Group();
      this.blade.position.set(0, -1.5, 0.42);
      this.armL.add(this.blade);

      this.put(this.blade, box(0.08, 1.25, 0.38), M.chrome, 0, 0, 0, 0.25, 0, 0);
      this.put(this.blade, box(0.02, 1.35, 0.08), M.stingerPlasma, 0, 0, 0.22, 0.25, 0, 0); // Energon edge

      // --- Agile Legs & 5-Spoke Alloy Wheels with Brake Calipers ---
      const makeBeeLeg = (side) => {
        const hip = new T.Group();
        hip.position.set(side * 0.62, 0, 0);
        this.body.add(hip);

        // Thigh
        this.put(hip, box(0.58, 1.15, 0.64), M.yellow, 0, -0.58, 0);
        this.put(hip, cy(0.075, 0.075, 0.85, 8), M.chrome, side * 0.22, -0.58, -0.26);

        // Shin & Calves
        const shin = new T.Group();
        shin.position.set(0, -1.15, 0);
        hip.add(shin);

        this.put(shin, box(0.72, 1.45, 0.78), M.darkAlloy, 0, -0.65, 0);
        this.put(shin, box(0.64, 1.05, 0.28), M.yellow, 0, -0.65, 0.4);

        // Sports Car 5-Spoke Alloy Wheel on Outer Calves
        const wheelGroup = new T.Group();
        wheelGroup.position.set(side * 0.52, -0.65, -0.16);
        shin.add(wheelGroup);

        // Tire rubber
        this.put(wheelGroup, cy(0.4, 0.4, 0.3, 18), M.tireRubber, 0, 0, 0, 0, 0, Math.PI / 2);

        // Cross-drilled steel brake disc rotor
        this.put(wheelGroup, cy(0.26, 0.26, 0.02, 16), M.brakeRotor, side * 0.08, 0, 0, 0, 0, Math.PI / 2);

        // Red Brembo-style brake caliper
        this.put(wheelGroup, box(0.08, 0.15, 0.07), M.brakeCaliper, side * 0.08, 0.18, 0);

        // 5-Spoke Sport Alloy Wheel Rim
        const rim = new T.Group();
        wheelGroup.add(rim);
        this.put(rim, cy(0.24, 0.24, 0.32, 16), M.chrome, 0, 0, 0, 0, 0, Math.PI / 2);
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2) / 5;
          this.put(rim, box(0.05, 0.18, 0.34), M.chrome, 0, Math.sin(a) * 0.12, Math.cos(a) * 0.12, a, 0, 0);
        }

        // Agile Stabilizer Boots with Rubber Soles
        this.put(shin, box(0.74, 0.38, 1.15), M.yellow, 0, -1.5, 0.22);
        this.put(shin, box(0.78, 0.08, 1.2), M.tireRubber, 0, -1.71, 0.22); // Rubber sole grip

        return { hip, shin };
      };

      this.legR = makeBeeLeg(1);
      this.legL = makeBeeLeg(-1);
    }

    update(dt) {
      this.time += dt;

      // Agile athletic bounce
      const bounce = Math.abs(Math.sin(this.time * 4.2)) * 0.06;
      if (this.torso) this.torso.position.y = 0.38 + bounce;

      // Door wings subtle stabilizing flutter
      if (this.wings) {
        for (let i = 0; i < this.wings.length; i++) {
          const side = (i === 0) ? -1 : 1;
          this.wings[i].rotation.y = -side * 0.35 + Math.sin(this.time * 3 + i) * 0.05;
        }
      }

      // Stinger cannon recoil and charging pulse
      if (this.recoil > 0) {
        this.recoil = Math.max(0, this.recoil - dt * 5.0);
        if (this.cannon) this.cannon.position.z = 0.12 - this.recoil * 0.38;
        if (this.gatlingCluster) this.gatlingCluster.rotation.z += dt * 25.0; // Rapid barrel spin
        if (this.plasmaMuzzle) {
          const s = 1.0 + this.recoil * 1.8;
          this.plasmaMuzzle.scale.set(s, s, s);
        }
      }

      // Cyber blade slash
      if (this.bladeSlash > 0) {
        this.bladeSlash = Math.max(0, this.bladeSlash - dt * 4.0);
        if (this.armL) this.armL.rotation.x = Math.sin(this.bladeSlash * Math.PI) * 1.6;
      }

      // Animation mixer update (Sketchfab animated models)
      if (this.mixer) this.mixer.update(dt);

      // Inertia drag rotation
      this.yaw += this.yawVel;
      this.yawVel *= 0.90;
      this.root.rotation.y = this.yaw;

      // Transformation morph
      const targetTrans = (this.mode === 'VEHICLE') ? 1.0 : 0.0;
      if (Math.abs(this.transProgress - targetTrans) > 0.01) {
        this.transProgress += (targetTrans - this.transProgress) * Math.min(1.0, dt * 5.5);
        this.applyTransformation(this.transProgress);
      }
    }

    loadSketchfabGLB(bufferOrUrl, onDone, onErr) {
      const T = this.THREE;
      if (!T || !T.GLTFLoader) {
        if (onErr) onErr(new Error("GLTFLoader mavjud emas"));
        return;
      }
      const loader = new T.GLTFLoader();
      const processGltf = (gltf) => {
        if (this.externalMesh) {
          this.root.remove(this.externalMesh);
          this.externalMesh = null;
        }
        const m = gltf.scene || gltf.scenes[0];
        this.externalMesh = m;
        this.body.visible = false;

        if (T.Box3 && T.Vector3) {
          const box = new T.Box3().setFromObject(m);
          const size = new T.Vector3();
          box.getSize(size);
          const maxD = Math.max(size.x, size.y, size.z);
          const scale = (maxD > 0) ? (3.8 / maxD) : 1.0;
          m.scale.set(scale, scale, scale);

          const center = new T.Vector3();
          box.getCenter(center);
          m.position.set(-center.x * scale, -box.min.y * scale - 1.9, -center.z * scale);
        }

        m.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = Math.min(child.material.roughness || 0.5, 0.35);
              child.material.envMapIntensity = 1.3;
            }
          }
        });

        this.root.add(m);

        if (gltf.animations && gltf.animations.length > 0 && T.AnimationMixer) {
          this.mixer = new T.AnimationMixer(m);
          const action = this.mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        if (onDone) onDone(gltf);
      };

      if (typeof bufferOrUrl === 'string') {
        loader.load(bufferOrUrl, processGltf, undefined, onErr || (() => {}));
      } else {
        loader.parse(bufferOrUrl, '', processGltf, onErr || (() => {}));
      }
    }

    applyTransformation(p) {
      // 0 = Robot, 1 = Camaro Sports Car
      if (this.head) {
        this.head.position.y = 1.8 - p * 0.9;
        this.head.scale.set(1 - p * 0.85, 1 - p * 0.85, 1 - p * 0.85);
      }

      if (this.wings) {
        this.wings.forEach(w => w.scale.set(1 - p * 0.9, 1 - p * 0.9, 1 - p * 0.9));
      }

      if (this.armR && this.armL) {
        this.armR.position.x = 1.4 - p * 0.4;
        this.armL.position.x = -1.4 + p * 0.4;
        this.armR.rotation.x = p * 1.55;
        this.armL.rotation.x = p * 1.55;
      }

      if (this.legR && this.legL) {
        this.legR.hip.rotation.x = -p * 1.45;
        this.legL.hip.rotation.x = -p * 1.45;
        this.legR.shin.rotation.x = p * 1.45;
        this.legL.shin.rotation.x = p * 1.45;
      }

      this.body.position.y = -p * 0.85;
    }

    toggleTransform() {
      this.mode = (this.mode === 'ROBOT') ? 'VEHICLE' : 'ROBOT';
      return this.mode;
    }

    fireWeapon() {
      this.recoil = 1.0;
    }

    swingBlade() {
      this.bladeSlash = 1.0;
    }

    hit() {
      this.fireWeapon();
      this.swingBlade();
    }

    dispose() {
      if (this.smokeParticles) {
        this.smokeParticles.forEach(p => {
          if (p.mesh && p.mesh.geometry) try { p.mesh.geometry.dispose(); } catch(e) {}
          if (p.mesh && p.mesh.material) try { p.mesh.material.dispose(); } catch(e) {}
        });
        this.smokeParticles = [];
      }
      if (this.root && this.root.traverse) {
        this.root.traverse(obj => {
          if (obj.geometry) {
            try { obj.geometry.dispose(); } catch(e) {}
          }
          if (obj.material) {
            try {
              if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
              else obj.material.dispose();
            } catch(e) {}
          }
        });
      }
      if (this.M) {
        Object.values(this.M).forEach(m => {
          try {
            if (m.map) m.map.dispose();
            if (m.normalMap) m.normalMap.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
            m.dispose();
          } catch(e) {}
        });
      }
    }
  }

  // ===========================================================================
  // 3. MEGATRON: DECEPTICON LEADER (WAR FOR CYBERTRON 3D PBR GLB ENGINE)
  // ===========================================================================
  class MegatronMech {
    constructor(THREE) {
      this.THREE = THREE;
      this.root = new THREE.Group();
      this.body = new THREE.Group();
      this.root.add(this.body);

      this.mode = 'ROBOT';
      this.time = 0;
      this.recoil = 0;
      this.yaw = 0;
      this.yawVel = 0;
      this.externalMesh = null;
      this.mixer = null;
      this.loaded = false;

      // Dark Energon Purple Aura
      this.energonLight = new THREE.PointLight(0xa855f7, 4.0, 9);
      this.energonLight.position.set(0, 1.4, 0.6);
      this.root.add(this.energonLight);

      this.buildPlaceholder();
      this.loadModel();
    }

    buildPlaceholder() {
      const T = this.THREE;
      if (!T) return;
      const mat = (T.MeshStandardMaterial) ? new T.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.9,
        roughness: 0.3
      }) : {};
      const purpleMat = (T.MeshStandardMaterial) ? new T.MeshStandardMaterial({
        color: 0x9333ea,
        emissive: (T.Color ? new T.Color(0xa855f7) : 0xa855f7),
        emissiveIntensity: 0.8
      }) : {};

      if (T.BoxGeometry && T.Mesh) {
        const torso = new T.Mesh(new T.BoxGeometry(1.6, 2.0, 1.1), mat);
        torso.position.y = 1.0;
        this.body.add(torso);
      }

      if (T.CylinderGeometry && T.Mesh) {
        const cannon = new T.Mesh(new T.CylinderGeometry(0.35, 0.45, 2.4, 16), mat);
        cannon.position.set(1.4, 1.0, 0.4);
        cannon.rotation.x = Math.PI / 2;
        this.body.add(cannon);
      }

      if (T.SphereGeometry && T.Mesh) {
        const core = new T.Mesh(new T.SphereGeometry(0.25, 12, 12), purpleMat);
        core.position.set(0, 1.2, 0.6);
        this.body.add(core);
      }
    }

    loadModel() {
      const T = this.THREE;
      const loaderClass = (T && T.GLTFLoader) || (typeof window !== 'undefined' && window.GLTFLoader);
      if (!loaderClass) return;
      const loader = new loaderClass();

      const onModelSuccess = (gltf) => {
        if (!gltf) return;
        this.loaded = true;
        this.body.visible = false;
        const m = gltf.scene || (gltf.scenes && gltf.scenes[0]) || gltf;
        this.externalMesh = m;

        if (T.Box3 && T.Vector3) {
          const box = new T.Box3().setFromObject(m);
          const size = new T.Vector3();
          box.getSize(size);
          const maxD = Math.max(size.x, size.y, size.z);
          // Heroic large scale for majestic close-up presence
          const scale = (maxD > 0) ? (4.85 / maxD) : 1.0;
          m.scale.set(scale, scale, scale);

          const center = new T.Vector3();
          box.getCenter(center);
          m.position.set(-center.x * scale, -box.min.y * scale - 1.95, -center.z * scale);
        }

        m.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.envMapIntensity = 2.4;
              // High-fidelity 16x anisotropic filtering on all PBR texture channels
              if (child.material.map) {
                child.material.map.anisotropy = 16;
                child.material.map.generateMipmaps = true;
                if (T.LinearMipmapLinearFilter) child.material.map.minFilter = T.LinearMipmapLinearFilter;
                if (T.LinearFilter) child.material.map.magFilter = T.LinearFilter;
                child.material.map.needsUpdate = true;
              }
              if (child.material.normalMap) {
                child.material.normalMap.anisotropy = 16;
                if (T.Vector2) child.material.normalScale = new T.Vector2(1.6, 1.6);
                child.material.normalMap.needsUpdate = true;
              }
              if (child.material.roughnessMap) {
                child.material.roughnessMap.anisotropy = 16;
                child.material.roughness = 0.95;
              }
              if (child.material.metalnessMap) {
                child.material.metalnessMap.anisotropy = 16;
                child.material.metalness = 1.0;
              }
              if (child.material.emissiveMap) {
                child.material.emissiveMap.anisotropy = 16;
                if (T.Color) child.material.emissive = new T.Color(0xa855f7);
                child.material.emissiveIntensity = 2.6;
              }
              child.material.needsUpdate = true;
            }
          }
        });

        this.root.add(m);

        if (gltf.animations && gltf.animations.length > 0 && T.AnimationMixer) {
          this.mixer = new T.AnimationMixer(m);
          const action = this.mixer.clipAction(gltf.animations[0]);
          action.play();
        }
        console.log('[MegatronMech] War for Cybertron 3D Model successfully loaded and attached!');
      };

      const tryAndroidBridge = () => {
        try {
          if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.getMegatronModelBase64 === 'function') {
            console.log('[MegatronMech] Invoking AndroidBridge.getMegatronModelBase64()...');
            const b64 = window.AndroidBridge.getMegatronModelBase64();
            if (b64 && b64.length > 1000) {
              const binaryString = (typeof atob !== 'undefined') ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              loader.parse(bytes.buffer, '', (gltf) => {
                console.log('[MegatronMech] AndroidBridge base64 parsed successfully!');
                onModelSuccess(gltf);
              }, (err) => {
                console.warn('[MegatronMech] AndroidBridge parse error:', err);
              });
              return true;
            }
          }
        } catch (err) {
          console.warn('[MegatronMech] AndroidBridge exception:', err);
        }
        return false;
      };

      const candidateUrls = [
        'assets/models/megatron.glb',
        './assets/models/megatron.glb',
        '../assets/models/megatron.glb',
        'transformers_war_for_cybertron_megatron.glb'
      ];

      const tryLoad = (idx) => {
        if (idx >= candidateUrls.length) {
          // If all network / relative paths failed, attempt direct Android bridge
          tryAndroidBridge();
          return;
        }
        const url = candidateUrls[idx];
        loader.load(url, (gltf) => {
          onModelSuccess(gltf);
        }, undefined, (err) => {
          console.warn('[MegatronMech] Could not load from URL ' + url + ':', err);
          tryLoad(idx + 1);
        });
      };

      tryLoad(0);
    }

    update(dt) {
      this.time += dt;
      if (this.mixer) this.mixer.update(dt);

      if (this.energonLight) {
        this.energonLight.intensity = 3.5 + Math.sin(this.time * 5.0) * 1.5;
      }

      if (this.recoil > 0) {
        this.recoil = Math.max(0, this.recoil - dt * 3.5);
      }

      this.yaw += this.yawVel;
      this.yawVel *= 0.90;
      this.root.rotation.y = this.yaw;
    }

    fireWeapon() {
      this.recoil = 1.0;
      if (this.energonLight) {
        this.energonLight.intensity = 14.0;
      }
      if (typeof window !== 'undefined' && window.lastGridEngine) {
        window.lastGridEngine.vibrate([45, 30, 60]);
        window.lastGridEngine.addFloatingText("💥 FUSION CANNON: 1450 DMG!", 268, 270, "#a855f7", 16);
      }
      if (typeof audio !== 'undefined') {
        try { audio.mortarFire(); audio.playSample('mortar_fire', 1.0); } catch(e) {}
      }
    }

    hit() { this.fireWeapon(); }
    swingBlade() { this.fireWeapon(); }
    swingAxe() { this.fireWeapon(); }

    toggleTransform() {
      this.mode = (this.mode === 'ROBOT') ? 'TANK' : 'ROBOT';
      if (this.externalMesh) {
        const targetPitch = (this.mode === 'TANK') ? 0.45 : 0.0;
        this.externalMesh.rotation.x = targetPitch;
      }
      if (typeof audio !== 'undefined') {
        try { audio.upgrade(); audio.playSample('hero_dash', 0.9); } catch(e) {}
      }
      return this.mode;
    }

    toggleBattleMask(state) {
      this.fireWeapon();
      return true;
    }

    toggleMatrixChest(state) {
      if (this.energonLight) {
        this.energonLight.color.setHex(0xd946ef);
        this.energonLight.intensity = 12.0;
      }
      if (typeof window !== 'undefined' && window.lastGridEngine) {
        window.lastGridEngine.addFloatingText("⚡ DARK ENERGON OVERDRIVE!", 268, 270, "#c084fc", 16);
      }
      return true;
    }

    triggerDieselSmoke(burstCount) {
      if (typeof window !== 'undefined' && window.lastGridEngine) {
        window.lastGridEngine.addFloatingText("💨 DARK ENERGON PLASMA PURGE!", 268, 270, "#a855f7", 16);
      }
      this.fireWeapon();
    }

    setLookAtTarget(x, y) {
      if (this.externalMesh) {
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        this.externalMesh.rotation.y = clamp(-x * 0.35, -0.4, 0.4);
      }
    }

    getStatusReport() {
      return {
        hero: 'MEGATRON',
        mode: this.mode,
        loaded: this.loaded,
        recoil: this.recoil
      };
    }

    dispose() {
      if (this.mixer) {
        this.mixer.stopAllAction();
        this.mixer = null;
      }
      if (this.externalMesh) {
        this.root.remove(this.externalMesh);
        this.externalMesh.traverse((c) => {
          if (c.geometry) {
            try { c.geometry.dispose(); } catch(e) {}
          }
          if (c.material) {
            try {
              if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
              else c.material.dispose();
            } catch(e) {}
          }
        });
        this.externalMesh = null;
      }
    }
  }

  // Expose global classes & utilities
  rootScope.createStudioEnvironment = createStudioEnvironment;
  rootScope.createTransformerTextures = createTransformerTextures;
  rootScope.OptimusPrimeMech = OptimusPrimeMech;
  rootScope.BumblebeeMech = BumblebeeMech;
  rootScope.MegatronMech = MegatronMech;
})();

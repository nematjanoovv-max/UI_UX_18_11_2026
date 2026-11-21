// =============================================================================
// CODEX 3D ENGINE (Three.js Photorealistic WebGL 3D Viewport)
// Designed for Tower Defense: Last Grid - Kiber-Kodex Encyclopedia
// Features: 
//   - True PBR Materials (Brushed Titanium, Carbon Fiber, Hazard Chevrons, Chrome Pistons)
//   - Procedural Normal Maps, Roughness Maps & Specular Highlights
//   - Studio 3-Point Lighting (Key, Fill, Rim Cyan, Rim Magenta, Ambient)
//   - 25 Fully Articulated Procedural 3D Models:
//       * 8 Towers: Pulse, Mortar, Cryo, Tesla, Flame, Railgun, Beacon, Barricade
//       * 9 Enemies: Grunt, Sprinter, Brute, Shieldbearer, Medic, Splitter, Phantom, Kamikaze, Gunship
//       * 6 Titans: Juggernaut, Overseer, Hive Titan, Void Titan, Chrono Phantom, Mecha Colossus
//       * 2 Hero Modes: APEX-01 Biped Assault, APEX-01 Siege Tank
//   - Interactive 360° Drag Orbit, Pitch & Zoom
//   - Shading Modes: PBR_ULTRA, WIREFRAME, XRAY
//   - Seamless Offscreen Rendering to 2D Canvas Blit
// =============================================================================

(function() {
  'use strict';

  if (typeof window === 'undefined') return;

  // --- Procedural Texture & PBR Suite ---
  function createCodexPBRTextures(THREE) {
    let _seed = 4567891;
    const rnd = () => {
      _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0;
      let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    function metalCanvas(baseHex, noiseAmt = 18, size = 256) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      g.fillStyle = baseHex; g.fillRect(0, 0, size, size);
      const img = g.getImageData(0, 0, size, size), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (rnd() - 0.5) * noiseAmt;
        d[i] = Math.min(255, Math.max(0, d[i] + n));
        d[i+1] = Math.min(255, Math.max(0, d[i+1] + n));
        d[i+2] = Math.min(255, Math.max(0, d[i+2] + n));
      }
      g.putImageData(img, 0, 0);

      // Panel seam lines
      for (let i = 0; i < 12; i++) {
        const x = rnd() * size, y = rnd() * size, w = 35 + rnd() * 80, h = 30 + rnd() * 60;
        g.strokeStyle = 'rgba(0, 0, 0, 0.55)'; g.lineWidth = 1.5;
        g.strokeRect(x, y, w, h);
        g.strokeStyle = 'rgba(255, 255, 255, 0.12)'; g.lineWidth = 1.0;
        g.strokeRect(x + 1, y + 1, w, h);
      }
      return c;
    }

    function normalFromHeight(size = 256, strength = 2.0) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      const img = g.createImageData(size, size), d = img.data;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const nx = (rnd() - 0.5) * strength;
          const ny = (rnd() - 0.5) * strength;
          const nz = 1.0;
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
          d[idx] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
          d[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
          d[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
          d[idx + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      return c;
    }

    function hazardCanvas() {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d');
      g.fillStyle = '#ffd600'; g.fillRect(0, 0, 128, 128);
      g.fillStyle = '#111827';
      for (let i = -128; i < 256; i += 32) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 16, 0); g.lineTo(i + 144, 128); g.lineTo(i + 128, 128); g.closePath(); g.fill();
      }
      g.strokeStyle = 'rgba(0, 0, 0, 0.6)'; g.lineWidth = 2.5;
      g.strokeRect(0, 0, 128, 128);
      return c;
    }

    function makeTex(can, rx = 1, ry = 1) {
      const t = new THREE.CanvasTexture(can);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      return t;
    }

    return {
      tTitanium: makeTex(metalCanvas('#242e42'), 2, 2),
      tCarbon: makeTex(metalCanvas('#141824', 28), 3, 3),
      tArmorLight: makeTex(metalCanvas('#3b4a68'), 2, 2),
      tHazard: makeTex(hazardCanvas(), 2, 2),
      tNormal: makeTex(normalFromHeight(256, 1.8), 2, 2)
    };
  }

  // --- Material Library ---
  class CodexMaterialLibrary {
    constructor(THREE) {
      this.THREE = THREE;
      const tex = createCodexPBRTextures(THREE);
      const std = o => new THREE.MeshStandardMaterial(o);

      this.materials = {
        // Heavy Armor
        titanium: std({ map: tex.tTitanium, normalMap: tex.tNormal, color: 0xffffff, metalness: 0.82, roughness: 0.38 }),
        carbon: std({ map: tex.tCarbon, normalMap: tex.tNormal, color: 0xffffff, metalness: 0.70, roughness: 0.48 }),
        armorLight: std({ map: tex.tArmorLight, color: 0xffffff, metalness: 0.75, roughness: 0.40 }),
        hazard: std({ map: tex.tHazard, color: 0xffffff, metalness: 0.25, roughness: 0.55 }),

        // Pure Metals & Mechanical Components
        chrome: std({ color: 0xe2e8f0, metalness: 1.0, roughness: 0.15 }),
        steel: std({ color: 0x475569, metalness: 0.88, roughness: 0.32 }),
        darkAlloy: std({ color: 0x0f172a, metalness: 0.65, roughness: 0.65 }),
        barrel: std({ color: 0x1e293b, metalness: 0.95, roughness: 0.25 }),
        copper: std({ color: 0xd97706, metalness: 0.92, roughness: 0.28 }),
        goldTrim: std({ color: 0xf59e0b, metalness: 0.85, roughness: 0.30 }),

        // Emissive Energies
        cyanEnergy: std({ color: 0x082f49, emissive: 0x00e5ff, emissiveIntensity: 2.4, metalness: 0.2, roughness: 0.3 }),
        magentaEnergy: std({ color: 0x4a044e, emissive: 0xff007f, emissiveIntensity: 2.2, metalness: 0.2, roughness: 0.3 }),
        plasmaYellow: std({ color: 0x422006, emissive: 0xffd600, emissiveIntensity: 2.2, metalness: 0.2, roughness: 0.3 }),
        flameOrange: std({ color: 0x431407, emissive: 0xff5722, emissiveIntensity: 2.4, metalness: 0.2, roughness: 0.3 }),
        acidGreen: std({ color: 0x052e16, emissive: 0x00e676, emissiveIntensity: 2.4, metalness: 0.2, roughness: 0.3 }),
        voidPurple: std({ color: 0x2e1065, emissive: 0xa855f7, emissiveIntensity: 2.5, metalness: 0.2, roughness: 0.3 }),

        // Special Glass & Translucent
        glassCyan: std({ color: 0x0284c7, emissive: 0x00e5ff, emissiveIntensity: 0.6, metalness: 0.9, roughness: 0.08, transparent: true, opacity: 0.65 }),
        cryoIce: std({ color: 0xe0f2fe, emissive: 0x38bdf8, emissiveIntensity: 0.7, metalness: 0.3, roughness: 0.12, transparent: true, opacity: 0.75 }),
        bioChitin: std({ color: 0x312e81, emissive: 0x6366f1, emissiveIntensity: 0.5, metalness: 0.45, roughness: 0.55 }),

        // Diagnostic wireframe
        wireframe: new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true }),
        xray: std({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.8, transparent: true, opacity: 0.35, roughness: 0.2 })
      };
    }

    get(name, mode = 'SHADED') {
      if (mode === 'WIREFRAME') return this.materials.wireframe;
      if (mode === 'XRAY') return this.materials.xray;
      return this.materials[name] || this.materials.titanium;
    }
  }

  // --- 3D Model Factory for All 25 Units ---
  class Codex3DModelFactory {
    constructor(THREE, matLib) {
      this.THREE = THREE;
      this.mats = matLib;
    }

    mesh(parent, geo, matName, mode, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
      const m = new this.THREE.Mesh(geo, this.mats.get(matName, mode));
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    }

    createPlatform(root, mode) {
      const T = this.THREE;
      const grp = new T.Group();
      root.add(grp);

      // Base octagonal platform
      this.mesh(grp, new T.CylinderGeometry(3.6, 3.8, 0.35, 8), 'carbon', mode, 0, -1.8, 0);
      this.mesh(grp, new T.TorusGeometry(3.3, 0.06, 8, 48), 'cyanEnergy', mode, 0, -1.6, 0, Math.PI / 2, 0, 0);
      this.mesh(grp, new T.TorusGeometry(2.4, 0.04, 8, 48), 'plasmaYellow', mode, 0, -1.6, 0, Math.PI / 2, 0, 0);

      // Edge hazard warning clamps
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4 + Math.PI / 8;
        const cx = Math.cos(ang) * 3.4;
        const cz = Math.sin(ang) * 3.4;
        this.mesh(grp, new T.BoxGeometry(0.8, 0.08, 0.22), 'hazard', mode, cx, -1.6, cz, 0, -ang + Math.PI / 2, 0);
        this.mesh(grp, new T.SphereGeometry(0.08, 8, 8), 'cyanEnergy', mode, cx * 1.08, -1.56, cz * 1.08);
      }
      return grp;
    }

    // --- 1. TOWERS (8 Units) ---
    buildPulseTower(root, mode, branch) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Hexagonal pedestal & reinforced ring
      this.mesh(g, new T.CylinderGeometry(1.6, 1.9, 0.8, 6), 'carbon', mode, 0, -1.3, 0);
      this.mesh(g, new T.TorusGeometry(1.5, 0.08, 8, 32), 'cyanEnergy', mode, 0, -0.9, 0, Math.PI / 2, 0, 0);
      this.mesh(g, new T.CylinderGeometry(1.2, 1.4, 0.6, 16), 'titanium', mode, 0, -0.6, 0);

      // Swivel Turret Head
      const head = new T.Group();
      head.position.set(0, 0.2, 0);
      g.add(head);
      this.mesh(head, new T.BoxGeometry(1.4, 0.9, 1.6), 'titanium', mode, 0, 0, 0);
      this.mesh(head, new T.SphereGeometry(0.35, 16, 16), 'cyanEnergy', mode, 0, 0.2, 0.6);

      // Barrels (Twin or Gatling if branch B)
      const barrels = new T.Group();
      head.add(barrels);
      const isGatling = (branch === 'BRANCH_B');
      const bCount = isGatling ? 4 : 2;

      for (let i = 0; i < bCount; i++) {
        const ang = (i * Math.PI * 2) / bCount;
        const bx = isGatling ? Math.cos(ang) * 0.35 : (i === 0 ? -0.45 : 0.45);
        const by = isGatling ? Math.sin(ang) * 0.35 : 0;
        this.mesh(barrels, new T.CylinderGeometry(0.12, 0.12, 1.9, 12), 'barrel', mode, bx, by, 1.1, Math.PI / 2, 0, 0);
        this.mesh(barrels, new T.CylinderGeometry(0.16, 0.16, 0.35, 12), 'chrome', mode, bx, by, 1.8, Math.PI / 2, 0, 0);
        this.mesh(barrels, new T.TorusGeometry(0.13, 0.03, 6, 16), 'cyanEnergy', mode, bx, by, 1.6, 0, 0, 0);
      }
      return { group: g, head, barrels, rotSpeed: 0.6 };
    }

    buildMortarTower(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Heavy 4-foot outrigger base
      this.mesh(g, new T.CylinderGeometry(1.8, 2.2, 0.6, 8), 'carbon', mode, 0, -1.4, 0);
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        this.mesh(g, new T.BoxGeometry(0.4, 0.5, 1.2), 'hazard', mode, Math.cos(a) * 1.8, -1.4, Math.sin(a) * 1.8, 0, -a, 0);
      }

      // Turret Pivot & Cannon Yoke
      const head = new T.Group();
      head.position.set(0, -0.6, 0);
      g.add(head);
      this.mesh(head, new T.BoxGeometry(1.6, 0.8, 1.4), 'titanium', mode, 0, 0, 0);

      // Elevated Heavy Mortar Barrel
      const barrel = new T.Group();
      barrel.position.set(0, 0.4, 0);
      barrel.rotation.x = -0.55; // 35 deg angle
      head.add(barrel);
      this.mesh(barrel, new T.CylinderGeometry(0.48, 0.58, 2.4, 16), 'barrel', mode, 0, 0.9, 0);
      this.mesh(barrel, new T.CylinderGeometry(0.58, 0.58, 0.45, 16), 'titanium', mode, 0, 1.9, 0);
      this.mesh(barrel, new T.TorusGeometry(0.5, 0.06, 8, 24), 'plasmaYellow', mode, 0, 1.4, 0, Math.PI / 2, 0, 0);

      // Hydraulic Recoil Pistons
      this.mesh(barrel, new T.CylinderGeometry(0.08, 0.08, 1.2, 8), 'chrome', mode, -0.55, 0.6, -0.2);
      this.mesh(barrel, new T.CylinderGeometry(0.08, 0.08, 1.2, 8), 'chrome', mode, 0.55, 0.6, -0.2);
      return { group: g, head, barrel, rotSpeed: 0.35 };
    }

    buildCryoTower(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Insulated Cryo Platform
      this.mesh(g, new T.CylinderGeometry(1.6, 1.8, 0.6, 6), 'carbon', mode, 0, -1.4, 0);
      this.mesh(g, new T.CylinderGeometry(1.2, 1.4, 0.5, 16), 'titanium', mode, 0, -0.9, 0);

      // Central Cryogenic Reactor Core
      this.mesh(g, new T.CylinderGeometry(0.65, 0.65, 1.4, 16), 'cryoIce', mode, 0, 0.1, 0);
      this.mesh(g, new T.SphereGeometry(0.45, 16, 16), 'cyanEnergy', mode, 0, 0.1, 0);

      // 3 Liquid Nitrogen Pressure Tanks on outer perimeter
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const tx = Math.cos(a) * 1.1;
        const tz = Math.sin(a) * 1.1;
        this.mesh(g, new T.CylinderGeometry(0.24, 0.24, 1.2, 12), 'chrome', mode, tx, 0, tz);
        this.mesh(g, new T.SphereGeometry(0.24, 12, 12), 'titanium', mode, tx, 0.6, tz);
      }

      // Emitter Flared Funnel on top
      const emitter = new T.Group();
      emitter.position.set(0, 1.0, 0);
      g.add(emitter);
      this.mesh(emitter, new T.ConeGeometry(1.2, 0.8, 16, 1, true), 'titanium', mode, 0, 0.2, 0, Math.PI, 0, 0);
      this.mesh(emitter, new T.TorusGeometry(1.1, 0.08, 8, 32), 'cyanEnergy', mode, 0, 0.55, 0, Math.PI / 2, 0, 0);
      return { group: g, emitter, rotSpeed: 0.8 };
    }

    buildTeslaTower(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // High voltage base
      this.mesh(g, new T.CylinderGeometry(1.5, 1.8, 0.6, 8), 'carbon', mode, 0, -1.4, 0);
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        this.mesh(g, new T.BoxGeometry(0.3, 0.3, 0.6), 'hazard', mode, Math.cos(a) * 1.4, -1.4, Math.sin(a) * 1.4, 0, -a, 0);
      }

      // Ceramic Ring Stack
      for (let i = 0; i < 6; i++) {
        const y = -0.9 + i * 0.35;
        const rad = 0.9 - i * 0.08;
        this.mesh(g, new T.TorusGeometry(rad, 0.12, 8, 24), 'copper', mode, 0, y, 0, Math.PI / 2, 0, 0);
        this.mesh(g, new T.CylinderGeometry(0.22, 0.22, 0.35, 12), 'darkAlloy', mode, 0, y, 0);
      }

      // Top Primary Spherical Discharge Electrode & Orbiting Ring
      const topNode = new T.Group();
      topNode.position.set(0, 1.3, 0);
      g.add(topNode);
      this.mesh(topNode, new T.SphereGeometry(0.65, 24, 24), 'copper', mode, 0, 0, 0);
      this.mesh(topNode, new T.TorusGeometry(0.9, 0.05, 8, 32), 'magentaEnergy', mode, 0, 0, 0, Math.PI / 2, 0, 0);
      this.mesh(topNode, new T.TorusGeometry(1.1, 0.04, 8, 32), 'cyanEnergy', mode, 0, 0, 0, 0, Math.PI / 4, 0);
      return { group: g, topNode, rotSpeed: 1.2 };
    }

    buildFlameTower(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Base with fuel pipes
      this.mesh(g, new T.CylinderGeometry(1.6, 1.8, 0.6, 8), 'carbon', mode, 0, -1.4, 0);

      // Turret Body & Dual Pressure Napalm Tanks
      const head = new T.Group();
      head.position.set(0, -0.6, 0);
      g.add(head);
      this.mesh(head, new T.BoxGeometry(1.5, 0.8, 1.4), 'titanium', mode, 0, 0, 0);
      this.mesh(head, new T.CylinderGeometry(0.35, 0.35, 1.4, 12), 'flameOrange', mode, -0.9, 0.2, -0.2, Math.PI / 2, 0, 0);
      this.mesh(head, new T.CylinderGeometry(0.35, 0.35, 1.4, 12), 'flameOrange', mode, 0.9, 0.2, -0.2, Math.PI / 2, 0, 0);

      // Heavy Twin Flamethrower Projector Nozzles
      const nozzles = new T.Group();
      nozzles.position.set(0, 0.1, 0.8);
      head.add(nozzles);
      [-0.38, 0.38].forEach(x => {
        this.mesh(nozzles, new T.CylinderGeometry(0.18, 0.26, 1.6, 12), 'barrel', mode, x, 0, 0.6, Math.PI / 2, 0, 0);
        this.mesh(nozzles, new T.ConeGeometry(0.32, 0.4, 12, 1, true), 'titanium', mode, x, 0, 1.4, -Math.PI / 2, 0, 0);
        this.mesh(nozzles, new T.SphereGeometry(0.1, 8, 8), 'flameOrange', mode, x, 0, 1.5);
      });
      return { group: g, head, nozzles, rotSpeed: 0.5 };
    }

    buildRailgunTower(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Heavy anchoring chassis
      this.mesh(g, new T.CylinderGeometry(1.8, 2.2, 0.7, 8), 'carbon', mode, 0, -1.4, 0);

      // Elevating Turret Base
      const head = new T.Group();
      head.position.set(0, -0.4, 0);
      g.add(head);
      this.mesh(head, new T.BoxGeometry(1.6, 1.0, 1.8), 'titanium', mode, 0, 0, 0);

      // Long Accelerator Rails Assembly
      const rails = new T.Group();
      rails.position.set(0, 0.4, 0.4);
      head.add(rails);

      // Top & Bottom Heavy Magnet Rails
      this.mesh(rails, new T.BoxGeometry(0.8, 0.18, 3.6), 'titanium', mode, 0, 0.3, 1.6);
      this.mesh(rails, new T.BoxGeometry(0.8, 0.18, 3.6), 'titanium', mode, 0, -0.3, 1.6);

      // Glowing Magnetic Accelerator Coils
      for (let i = 0; i < 7; i++) {
        const z = 0.2 + i * 0.48;
        this.mesh(rails, new T.TorusGeometry(0.32, 0.05, 8, 16), 'cyanEnergy', mode, 0, 0, z);
      }
      this.mesh(rails, new T.BoxGeometry(0.3, 0.3, 0.6), 'magentaEnergy', mode, 0, 0, -0.4);
      return { group: g, head, rails, rotSpeed: 0.3 };
    }

    buildBeaconTower(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Sensor mast base
      this.mesh(g, new T.CylinderGeometry(1.5, 1.7, 0.6, 6), 'carbon', mode, 0, -1.4, 0);
      this.mesh(g, new T.CylinderGeometry(0.3, 0.5, 2.0, 8), 'titanium', mode, 0, -0.2, 0);

      // Rotating Radar Dish & Mast
      const dish = new T.Group();
      dish.position.set(0, 1.0, 0);
      g.add(dish);

      // Parabolic Antenna Dish
      this.mesh(dish, new T.CylinderGeometry(1.3, 0.2, 0.35, 16, 1, true), 'titanium', mode, 0, 0, 0, 0.4, 0, 0);
      this.mesh(dish, new T.TorusGeometry(1.3, 0.05, 8, 32), 'plasmaYellow', mode, 0, 0.1, 0, Math.PI / 2 + 0.4, 0, 0);
      this.mesh(dish, new T.CylinderGeometry(0.04, 0.04, 0.9, 8), 'chrome', mode, 0, 0.3, 0.4, 0.4, 0, 0);
      this.mesh(dish, new T.SphereGeometry(0.12, 8, 8), 'cyanEnergy', mode, 0, 0.45, 0.7);
      return { group: g, dish, rotSpeed: 1.8 };
    }

    buildBarricade(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Sloped Heavy Blast Barrier
      this.mesh(g, new T.BoxGeometry(3.2, 1.8, 1.2), 'titanium', mode, 0, -0.7, 0);
      this.mesh(g, new T.BoxGeometry(3.2, 0.35, 0.8), 'hazard', mode, 0, 0.1, 0);

      // Deployable Tungsten Teeth & Energy Shield Generator
      for (let i = -2; i <= 2; i++) {
        this.mesh(g, new T.ConeGeometry(0.22, 0.9, 6), 'darkAlloy', mode, i * 0.65, 0.5, 0.3, -0.3, 0, 0);
      }
      this.mesh(g, new T.SphereGeometry(0.4, 16, 16), 'cyanEnergy', mode, 0, -0.6, 0.65);
      return { group: g, rotSpeed: 0.2 };
    }

    // --- 2. HOSTILE ENEMIES (9 Units) ---
    buildGrunt(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Pelvis & Torso
      const torso = new T.Group();
      g.add(torso);
      this.mesh(torso, new T.BoxGeometry(0.9, 1.0, 0.6), 'titanium', mode, 0, 0.4, 0);
      this.mesh(torso, new T.BoxGeometry(0.5, 0.3, 0.1), 'cyanEnergy', mode, 0, 0.4, 0.32);

      // Helmet with glowing visor
      const head = new T.Group();
      head.position.set(0, 1.1, 0);
      torso.add(head);
      this.mesh(head, new T.BoxGeometry(0.55, 0.5, 0.6), 'darkAlloy', mode, 0, 0, 0);
      this.mesh(head, new T.BoxGeometry(0.45, 0.12, 0.1), 'cyanEnergy', mode, 0, 0.05, 0.32);

      // Right Arm with Plasma Carbine
      const armR = new T.Group();
      armR.position.set(0.65, 0.6, 0);
      torso.add(armR);
      this.mesh(armR, new T.BoxGeometry(0.25, 0.7, 0.3), 'carbon', mode, 0, -0.3, 0.1);
      this.mesh(armR, new T.BoxGeometry(0.2, 0.3, 1.2), 'barrel', mode, 0, -0.6, 0.5);
      this.mesh(armR, new T.CylinderGeometry(0.06, 0.06, 0.6, 8), 'cyanEnergy', mode, 0, -0.55, 1.1, Math.PI / 2, 0, 0);

      // Left Arm
      const armL = new T.Group();
      armL.position.set(-0.65, 0.6, 0);
      torso.add(armL);
      this.mesh(armL, new T.BoxGeometry(0.25, 0.8, 0.3), 'carbon', mode, 0, -0.3, 0);

      // Digitigrade Biped Legs
      const legR = new T.Group(); legR.position.set(0.35, -0.1, 0); g.add(legR);
      this.mesh(legR, new T.BoxGeometry(0.3, 0.8, 0.35), 'carbon', mode, 0, -0.4, -0.1, -0.25, 0, 0);
      this.mesh(legR, new T.BoxGeometry(0.24, 0.8, 0.3), 'titanium', mode, 0, -0.9, 0.1, 0.35, 0, 0);
      this.mesh(legR, new T.BoxGeometry(0.32, 0.15, 0.5), 'darkAlloy', mode, 0, -1.35, 0.2);

      const legL = new T.Group(); legL.position.set(-0.35, -0.1, 0); g.add(legL);
      this.mesh(legL, new T.BoxGeometry(0.3, 0.8, 0.35), 'carbon', mode, 0, -0.4, -0.1, -0.25, 0, 0);
      this.mesh(legL, new T.BoxGeometry(0.24, 0.8, 0.3), 'titanium', mode, 0, -0.9, 0.1, 0.35, 0, 0);
      this.mesh(legL, new T.BoxGeometry(0.32, 0.15, 0.5), 'darkAlloy', mode, 0, -1.35, 0.2);

      return { group: g, torso, armR, legR, legL, isBiped: true };
    }

    buildSprinter(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Sleek predatory raptor chassis
      const body = new T.Group();
      g.add(body);
      this.mesh(body, new T.ConeGeometry(0.55, 2.2, 8), 'carbon', mode, 0, 0.1, 0, -Math.PI / 2 + 0.2, 0, 0);

      // Head with red sensory eye array
      const head = new T.Group();
      head.position.set(0, 0.2, 1.2);
      body.add(head);
      this.mesh(head, new T.ConeGeometry(0.35, 0.9, 6), 'darkAlloy', mode, 0, 0, 0.3, Math.PI / 2, 0, 0);
      this.mesh(head, new T.BoxGeometry(0.4, 0.08, 0.08), 'magentaEnergy', mode, 0, 0.1, 0.5);

      // Bladed Tail Stabilizer
      this.mesh(body, new T.BoxGeometry(0.08, 0.35, 1.6), 'titanium', mode, 0, 0.3, -1.6, -0.2, 0, 0);

      // Quadruped/Raptor Spring Legs
      [-0.45, 0.45].forEach(s => {
        this.mesh(g, new T.CylinderGeometry(0.08, 0.08, 1.4, 8), 'chrome', mode, s, -0.6, -0.2, 0.4, 0, 0);
        this.mesh(g, new T.BoxGeometry(0.2, 0.1, 0.5), 'darkAlloy', mode, s, -1.3, -0.4);
      });
      return { group: g, body, head, isSprinter: true };
    }

    buildBrute(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Heavy armored torso
      const torso = new T.Group();
      g.add(torso);
      this.mesh(torso, new T.BoxGeometry(2.0, 1.6, 1.4), 'titanium', mode, 0, 0.4, 0);
      this.mesh(torso, new T.BoxGeometry(1.6, 0.4, 0.2), 'hazard', mode, 0, 0.8, 0.72);

      // Dual heavy exhaust smokestacks
      [-0.7, 0.7].forEach(s => {
        this.mesh(torso, new T.CylinderGeometry(0.18, 0.22, 1.2, 8), 'barrel', mode, s, 1.4, -0.5, -0.25, 0, 0);
        this.mesh(torso, new T.SphereGeometry(0.12, 8, 8), 'flameOrange', mode, s, 1.9, -0.6);
      });

      // Pneumatic Spiked Power-Fists
      [-1.35, 1.35].forEach(s => {
        const arm = new T.Group();
        arm.position.set(s, 0.5, 0.3);
        torso.add(arm);
        this.mesh(arm, new T.BoxGeometry(0.7, 1.2, 0.8), 'darkAlloy', mode, 0, -0.4, 0);
        this.mesh(arm, new T.BoxGeometry(0.9, 0.9, 1.1), 'titanium', mode, 0, -1.0, 0.2);
        this.mesh(arm, new T.ConeGeometry(0.15, 0.4, 6), 'chrome', mode, 0, -1.0, 0.85, Math.PI / 2, 0, 0);
      });

      // Reinforced Heavy Pillar Legs
      [-0.6, 0.6].forEach(s => {
        this.mesh(g, new T.BoxGeometry(0.65, 1.4, 0.75), 'carbon', mode, s, -0.7, 0);
        this.mesh(g, new T.BoxGeometry(0.8, 0.3, 1.0), 'darkAlloy', mode, s, -1.35, 0.1);
      });
      return { group: g, torso, isBrute: true };
    }

    buildShieldbearer(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Heavy armored body
      const torso = new T.Group();
      g.add(torso);
      this.mesh(torso, new T.BoxGeometry(1.2, 1.4, 0.9), 'titanium', mode, 0, 0.2, -0.2);

      // Giant Tower Energy Shield in front
      const shield = new T.Group();
      shield.position.set(0, 0.1, 0.9);
      g.add(shield);
      this.mesh(shield, new T.BoxGeometry(2.4, 2.2, 0.15), 'titanium', mode, 0, 0, 0);
      this.mesh(shield, new T.BoxGeometry(2.1, 1.9, 0.2), 'cyanEnergy', mode, 0, 0, 0.05);
      this.mesh(shield, new T.TorusGeometry(0.5, 0.06, 6, 6), 'plasmaYellow', mode, 0, 0, 0.18);

      // Heavy Shoulder Shock Cannon
      this.mesh(torso, new T.CylinderGeometry(0.16, 0.2, 1.4, 8), 'barrel', mode, 0.75, 1.1, 0.2, Math.PI / 2, 0, 0);

      // Lower Legs
      [-0.45, 0.45].forEach(s => {
        this.mesh(g, new T.BoxGeometry(0.4, 1.2, 0.5), 'carbon', mode, s, -0.8, -0.2);
      });
      return { group: g, torso, shield };
    }

    buildMedic(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Floating Anti-Grav Spherical Hull
      const drone = new T.Group();
      g.add(drone);
      this.mesh(drone, new T.SphereGeometry(0.9, 24, 24), 'titanium', mode, 0, 0.2, 0);
      this.mesh(drone, new T.SphereGeometry(0.65, 16, 16), 'acidGreen', mode, 0, 0.2, 0);

      // Dual Counter-Rotating Gyroscopic Outer Rings
      const ring1 = this.mesh(drone, new T.TorusGeometry(1.25, 0.06, 8, 32), 'chrome', mode, 0, 0.2, 0, Math.PI / 3, 0, 0);
      const ring2 = this.mesh(drone, new T.TorusGeometry(1.4, 0.05, 8, 32), 'acidGreen', mode, 0, 0.2, 0, -Math.PI / 4, 0, 0);

      // 3 Nanite Welding Arms underneath
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const arm = new T.Group();
        arm.position.set(Math.cos(a) * 0.4, -0.5, Math.sin(a) * 0.4);
        drone.add(arm);
        this.mesh(arm, new T.CylinderGeometry(0.05, 0.05, 0.8, 8), 'chrome', mode, 0, -0.35, 0);
        this.mesh(arm, new T.SphereGeometry(0.09, 8, 8), 'acidGreen', mode, 0, -0.75, 0);
      }
      return { group: g, drone, ring1, ring2, isHover: true };
    }

    buildSplitter(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Central Bio-Crystalline Core
      const core = new T.Group();
      g.add(core);
      this.mesh(core, new T.OctahedronGeometry(0.95, 0), 'bioChitin', mode, 0, 0.2, 0);
      this.mesh(core, new T.SphereGeometry(0.55, 16, 16), 'magentaEnergy', mode, 0, 0.2, 0);

      // 4 Orbiting Cluster Shards
      const satellites = [];
      for (let i = 0; i < 4; i++) {
        const sat = new T.Group();
        g.add(sat);
        this.mesh(sat, new T.OctahedronGeometry(0.35, 0), 'titanium', mode, 0, 0, 0);
        this.mesh(sat, new T.SphereGeometry(0.18, 8, 8), 'magentaEnergy', mode, 0, 0, 0);
        satellites.push(sat);
      }
      return { group: g, core, satellites, isCluster: true };
    }

    buildPhantom(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Angular Stealth-Bomber Faceted Infiltrator
      const torso = new T.Group();
      g.add(torso);
      this.mesh(torso, new T.ConeGeometry(0.7, 1.8, 4), 'darkAlloy', mode, 0, 0.4, 0, Math.PI, 0, 0);
      this.mesh(torso, new T.BoxGeometry(0.8, 0.08, 0.08), 'magentaEnergy', mode, 0, 0.8, 0.35);

      // Long-Range Precision Sniper Railgun
      const gun = new T.Group();
      gun.position.set(0.5, 0.2, 0.4);
      torso.add(gun);
      this.mesh(gun, new T.BoxGeometry(0.18, 0.3, 2.6), 'barrel', mode, 0, 0, 0.8);
      this.mesh(gun, new T.CylinderGeometry(0.04, 0.04, 0.8, 8), 'magentaEnergy', mode, 0, 0, 1.9, Math.PI / 2, 0, 0);

      // Sleek Servo Legs
      [-0.35, 0.35].forEach(s => {
        this.mesh(g, new T.CylinderGeometry(0.06, 0.08, 1.4, 8), 'chrome', mode, s, -0.7, 0);
      });
      return { group: g, torso, isStealth: true };
    }

    buildKamikazeDrone(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Spherical Warhead Drone
      const body = new T.Group();
      g.add(body);
      this.mesh(body, new T.SphereGeometry(0.75, 16, 16), 'hazard', mode, 0, 0.2, 0);
      this.mesh(body, new T.SphereGeometry(0.55, 16, 16), 'flameOrange', mode, 0, 0.2, 0);

      // 4 High-Speed Thruster Cones
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        this.mesh(body, new T.ConeGeometry(0.18, 0.5, 8), 'carbon', mode, Math.cos(a) * 0.8, 0.2, Math.sin(a) * 0.8, 0, 0, a + Math.PI / 2);
      }
      return { group: g, body, isHover: true };
    }

    buildGunship(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Fuselage & Cockpit Glass
      const hull = new T.Group();
      g.add(hull);
      this.mesh(hull, new T.BoxGeometry(1.4, 0.9, 2.8), 'titanium', mode, 0, 0.3, 0);
      this.mesh(hull, new T.BoxGeometry(0.8, 0.5, 1.0), 'glassCyan', mode, 0, 0.5, 1.0);

      // Twin Tilting Ducted Rotor Nacelles
      const rotors = [];
      [-1.4, 1.4].forEach(s => {
        const pod = new T.Group();
        pod.position.set(s, 0.4, 0);
        hull.add(pod);
        this.mesh(pod, new T.CylinderGeometry(0.8, 0.8, 0.25, 16), 'carbon', mode, 0, 0, 0);
        const blades = this.mesh(pod, new T.BoxGeometry(1.5, 0.05, 0.15), 'chrome', mode, 0, 0, 0);
        rotors.push(blades);
      });

      // Chin Gatling Gun
      const turret = new T.Group();
      turret.position.set(0, -0.3, 1.3);
      hull.add(turret);
      this.mesh(turret, new T.CylinderGeometry(0.08, 0.08, 0.9, 8), 'barrel', mode, 0, 0, 0.4, Math.PI / 2, 0, 0);
      return { group: g, hull, rotors, isGunship: true };
    }

    // --- 3. TITAN BOSSES (6 Gigantic Units) ---
    buildJuggernaut(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Giant Dual Tank Treads
      [-1.4, 1.4].forEach(s => {
        this.mesh(g, new T.BoxGeometry(0.7, 0.9, 3.8), 'carbon', mode, s, -0.9, 0);
        this.mesh(g, new T.BoxGeometry(0.75, 0.25, 3.6), 'hazard', mode, s, -0.4, 0);
      });

      // Sloped Heavy Chassis
      this.mesh(g, new T.BoxGeometry(2.4, 0.9, 3.2), 'titanium', mode, 0, -0.2, 0);

      // Mega Rotating Turret & Super-Siege Cannon
      const turret = new T.Group();
      turret.position.set(0, 0.4, 0);
      g.add(turret);
      this.mesh(turret, new T.BoxGeometry(2.0, 1.0, 2.2), 'titanium', mode, 0, 0, 0);
      this.mesh(turret, new T.CylinderGeometry(0.28, 0.35, 3.2, 16), 'barrel', mode, 0, 0.1, 1.8, Math.PI / 2, 0, 0);
      this.mesh(turret, new T.TorusGeometry(0.36, 0.08, 8, 24), 'flameOrange', mode, 0, 0.1, 3.2);

      // Dual flamethrower exhausts
      [-0.8, 0.8].forEach(s => {
        this.mesh(turret, new T.CylinderGeometry(0.18, 0.24, 1.0, 8), 'barrel', mode, s, 0.7, -0.8, -0.3, 0, 0);
        this.mesh(turret, new T.SphereGeometry(0.12, 8, 8), 'flameOrange', mode, s, 1.2, -1.0);
      });
      return { group: g, turret, rotSpeed: 0.35 };
    }

    buildOverseer(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Massive Floating Mothership Hull
      const core = new T.Group();
      g.add(core);
      this.mesh(core, new T.SphereGeometry(1.6, 32, 32), 'carbon', mode, 0, 0.3, 0);
      this.mesh(core, new T.SphereGeometry(1.0, 24, 24), 'magentaEnergy', mode, 0, 0.3, 0.8);

      // 3 Giant Concentric Rotating Energy Rings
      const ringA = this.mesh(core, new T.TorusGeometry(2.2, 0.08, 8, 48), 'cyanEnergy', mode, 0, 0.3, 0, Math.PI / 2, 0, 0);
      const ringB = this.mesh(core, new T.TorusGeometry(2.6, 0.06, 8, 48), 'magentaEnergy', mode, 0, 0.3, 0, Math.PI / 3, Math.PI / 4, 0);
      const ringC = this.mesh(core, new T.TorusGeometry(3.0, 0.05, 8, 48), 'plasmaYellow', mode, 0, 0.3, 0, -Math.PI / 4, 0, Math.PI / 3);

      return { group: g, core, ringA, ringB, ringC, isOverseer: true };
    }

    buildHiveTitan(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Gigantic Bio-Cyber Carapace & Abdomen
      const body = new T.Group();
      g.add(body);
      this.mesh(body, new T.SphereGeometry(1.3, 24, 24), 'bioChitin', mode, 0, 0.2, -0.6);
      this.mesh(body, new T.SphereGeometry(0.9, 16, 16), 'acidGreen', mode, 0, 0.3, -0.6);
      this.mesh(body, new T.BoxGeometry(1.4, 0.9, 1.2), 'titanium', mode, 0, 0.1, 0.8);

      // 8 Towering Claws/Legs
      for (let i = 0; i < 8; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const row = Math.floor(i / 2);
        const leg = new T.Group();
        leg.position.set(side * 1.1, 0, -0.8 + row * 0.8);
        body.add(leg);
        this.mesh(leg, new T.CylinderGeometry(0.12, 0.16, 1.8, 8), 'carbon', mode, side * 0.5, 0.5, 0, 0, 0, -side * 0.6);
        this.mesh(leg, new T.CylinderGeometry(0.08, 0.12, 2.0, 8), 'darkAlloy', mode, side * 1.0, -0.6, 0, 0, 0, side * 0.4);
      }
      return { group: g, body, isHive: true };
    }

    buildVoidTitan(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Event Horizon Black Sphere
      const voidCore = new T.Group();
      g.add(voidCore);
      this.mesh(voidCore, new T.SphereGeometry(1.2, 32, 32), 'darkAlloy', mode, 0, 0.2, 0);
      this.mesh(voidCore, new T.SphereGeometry(1.15, 24, 24), 'voidPurple', mode, 0, 0.2, 0);

      // Swirling Accretion Disk Rings
      const disk1 = this.mesh(voidCore, new T.TorusGeometry(2.3, 0.12, 8, 48), 'voidPurple', mode, 0, 0.2, 0, Math.PI / 2.2, 0, 0);
      const disk2 = this.mesh(voidCore, new T.TorusGeometry(2.9, 0.08, 8, 48), 'magentaEnergy', mode, 0, 0.2, 0, Math.PI / 2.6, 0.3, 0);

      // 4 Floating Void Obelisks
      const obelisks = [];
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        const ob = new T.Group();
        ob.position.set(Math.cos(a) * 2.6, 0.2, Math.sin(a) * 2.6);
        voidCore.add(ob);
        this.mesh(ob, new T.ConeGeometry(0.3, 1.8, 4), 'carbon', mode, 0, 0, 0);
        this.mesh(ob, new T.SphereGeometry(0.15, 8, 8), 'voidPurple', mode, 0, 0.9, 0);
        obelisks.push(ob);
      }
      return { group: g, voidCore, disk1, disk2, obelisks, isVoid: true };
    }

    buildChronoPhantom(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Dimensional Prismatic Monoliths
      const chronoCore = new T.Group();
      g.add(chronoCore);
      this.mesh(chronoCore, new T.OctahedronGeometry(1.4, 0), 'cyanEnergy', mode, 0, 0.2, 0);
      this.mesh(chronoCore, new T.IcosahedronGeometry(0.8, 0), 'plasmaYellow', mode, 0, 0.2, 0);

      // Time Dial Halo Rings
      const dialA = this.mesh(chronoCore, new T.TorusGeometry(2.2, 0.06, 6, 36), 'cyanEnergy', mode, 0, 0.2, 0, Math.PI / 2, 0, 0);
      const dialB = this.mesh(chronoCore, new T.TorusGeometry(2.7, 0.05, 6, 36), 'chrome', mode, 0, 0.2, 0, 0, Math.PI / 3, 0);

      return { group: g, chronoCore, dialA, dialB, isChrono: true };
    }

    buildMechaColossus(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Massive 50m Dreadnought Torso
      const torso = new T.Group();
      g.add(torso);
      this.mesh(torso, new T.BoxGeometry(2.8, 2.0, 1.8), 'titanium', mode, 0, 0.6, 0);
      this.mesh(torso, new T.SphereGeometry(0.65, 16, 16), 'plasmaYellow', mode, 0, 0.6, 0.95); // Macro Reactor

      // Shoulder Hyper-Railgun Cannons
      [-1.8, 1.8].forEach(s => {
        const arm = new T.Group();
        arm.position.set(s, 0.9, 0.2);
        torso.add(arm);
        this.mesh(arm, new T.BoxGeometry(1.0, 1.2, 1.4), 'darkAlloy', mode, 0, 0, 0);
        this.mesh(arm, new T.CylinderGeometry(0.24, 0.3, 3.4, 12), 'barrel', mode, 0, -0.4, 1.5, Math.PI / 2, 0, 0);
        this.mesh(arm, new T.TorusGeometry(0.32, 0.06, 8, 16), 'cyanEnergy', mode, 0, -0.4, 2.8);
      });

      // Massive Hydraulic Suspension Pillar Legs
      [-0.9, 0.9].forEach(s => {
        this.mesh(g, new T.BoxGeometry(0.85, 1.8, 1.0), 'carbon', mode, s, -0.8, 0);
        this.mesh(g, new T.CylinderGeometry(0.14, 0.14, 1.2, 8), 'chrome', mode, s, -0.7, -0.5);
        this.mesh(g, new T.BoxGeometry(1.1, 0.35, 1.4), 'darkAlloy', mode, s, -1.6, 0.2);
      });
      return { group: g, torso, isColossus: true };
    }

    // --- 4. HERO MECH APEX-01 (2 Modes) ---
    buildApexBiped(root, mode) {
      const T = this.THREE;
      // If window.Apex01Mech is available, we can instantiate it, or build our procedural high-detail rig
      if (typeof window.Apex01Mech === 'function') {
        const mech = new window.Apex01Mech(T);
        mech.root.position.set(0, -1.2, 0);
        mech.root.scale.set(0.65, 0.65, 0.65);
        root.add(mech.root);
        return { group: mech.root, mechInstance: mech };
      }

      // Fallback articulated APEX-01 Mech
      const g = new T.Group();
      root.add(g);
      const torso = new T.Group(); g.add(torso);
      this.mesh(torso, new T.BoxGeometry(1.6, 1.3, 1.1), 'titanium', mode, 0, 0.5, 0);
      this.mesh(torso, new T.SphereGeometry(0.45, 16, 16), 'cyanEnergy', mode, 0, 0.4, 0.6);
      this.mesh(torso, new T.BoxGeometry(1.2, 0.2, 0.1), 'hazard', mode, 0, 0.8, 0.58);

      // Radar & Missile Pod
      this.mesh(torso, new T.TorusGeometry(0.4, 0.04, 6, 16), 'chrome', mode, -0.6, 1.4, -0.3, 0.3, 0, 0);
      this.mesh(torso, new T.BoxGeometry(0.6, 0.7, 0.9), 'darkAlloy', mode, 0.6, 1.3, -0.2);

      // Dual Heavy Arm Cannons
      [-1.1, 1.1].forEach(s => {
        this.mesh(torso, new T.BoxGeometry(0.4, 0.9, 0.5), 'carbon', mode, s, 0.4, 0);
        this.mesh(torso, new T.CylinderGeometry(0.12, 0.15, 2.0, 12), 'barrel', mode, s, 0.1, 0.8, Math.PI / 2, 0, 0);
      });

      // Digitigrade Legs
      [-0.55, 0.55].forEach(s => {
        this.mesh(g, new T.BoxGeometry(0.4, 1.1, 0.5), 'carbon', mode, s, -0.5, -0.1, -0.3, 0, 0);
        this.mesh(g, new T.CylinderGeometry(0.08, 0.08, 1.1, 8), 'chrome', mode, s, -0.5, -0.4);
        this.mesh(g, new T.BoxGeometry(0.35, 1.1, 0.45), 'titanium', mode, s, -1.0, 0.1, 0.35, 0, 0);
        this.mesh(g, new T.BoxGeometry(0.5, 0.2, 0.8), 'darkAlloy', mode, s, -1.5, 0.2);
      });
      return { group: g, torso, isBiped: true };
    }

    buildApexSiege(root, mode) {
      const T = this.THREE;
      const g = new T.Group();
      root.add(g);

      // Deployed Quad Track Chassis
      [-1.4, 1.4].forEach(s => {
        this.mesh(g, new T.BoxGeometry(0.65, 0.7, 3.4), 'carbon', mode, s, -1.1, 0);
        this.mesh(g, new T.BoxGeometry(0.7, 0.2, 3.2), 'hazard', mode, s, -0.7, 0);
      });

      // Heavy Sloped Tank Base
      this.mesh(g, new T.BoxGeometry(2.2, 0.8, 2.6), 'titanium', mode, 0, -0.5, 0);
      this.mesh(g, new T.SphereGeometry(0.5, 16, 16), 'plasmaYellow', mode, 0, -0.3, 0.4);

      // Dual 150mm Forward Siege Cannons
      const guns = new T.Group();
      guns.position.set(0, 0.2, 0.2);
      g.add(guns);
      [-0.55, 0.55].forEach(s => {
        this.mesh(guns, new T.CylinderGeometry(0.2, 0.25, 3.8, 16), 'barrel', mode, s, 0, 1.8, Math.PI / 2, 0, 0);
        this.mesh(guns, new T.BoxGeometry(0.48, 0.48, 0.6), 'darkAlloy', mode, s, 0, 3.6);
        this.mesh(guns, new T.TorusGeometry(0.26, 0.05, 8, 16), 'plasmaYellow', mode, s, 0, 2.8);
      });
      return { group: g, guns, isSiege: true };
    }
  }

  // --- Main Codex 3D Engine Class ---
  class Codex3DEngine {
    constructor() {
      this.active = false;
      this.canvas = null;
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.mats = null;
      this.factory = null;
      this.modelRoot = null;
      this.currentModelObj = null;

      this.currentId = null;
      this.currentTab = 'TOWERS';
      this.currentBranch = 'BASE';
      this.renderMode = 'SHADED';

      this.yaw = 0.45;
      this.pitch = 0.28;
      this.zoom = 1.0;
      this.recoil = 0;
      this.time = 0;
      this.lightPresetIdx = 0;

      this.width = 512;
      this.height = 512;

      this.gltfCache = {};
      this.activeMixer = null;
      this.modelMap = {
        pulse: 'assets/models/turret_scifi_hd.glb',
        railgun: 'assets/models/turret_railgun_hd.glb',
        grunt: 'assets/models/biped_robot_hd.glb',
        brute: 'assets/models/biped_robot_hd.glb',
        gunship: 'assets/models/mech_drone_hd.glb',
        juggernaut: 'assets/models/mech_drone_hd.glb',
        kamikaze_drone: 'assets/models/sphere_bot.glb',
        overseer: 'assets/models/sphere_bot.glb',
        megatron: 'assets/models/megatron_movie_hd.glb',
        optimus: 'assets/models/optimus.glb',
        bumblebee: 'assets/models/bumblebee.glb'
      };
    }

    loadGLTFModel(url, id, mode, branch, fallbackFn) {
      const THREE = window.THREE || (typeof THREE !== 'undefined' ? THREE : null);
      if (!THREE || !THREE.GLTFLoader) {
        if (fallbackFn) fallbackFn();
        return;
      }

      const attachGLTF = (gltf) => {
        if (this.currentId !== id) return;
        // Clean out placeholder or prior models
        while (this.modelRoot.children.length > 0) {
          const obj = this.modelRoot.children[0];
          this.modelRoot.remove(obj);
        }
        this.factory.createPlatform(this.modelRoot, mode);

        const scene = gltf.scene || gltf.scenes[0];
        const clone = scene.clone ? scene.clone(true) : scene;

        if (THREE.Box3 && THREE.Vector3) {
          const box = new THREE.Box3().setFromObject(clone);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxD = Math.max(size.x, size.y, size.z);
          const targetHeight = (id === 'pulse' || id === 'railgun') ? 2.1 : ((id === 'kamikaze_drone' || id === 'overseer') ? 1.7 : ((id === 'gunship' || id === 'juggernaut') ? 2.3 : 2.7));
          const scale = maxD > 0 ? (targetHeight / maxD) : 1.0;
          clone.scale.set(scale, scale, scale);

          const center = new THREE.Vector3();
          box.getCenter(center);
          clone.position.set(-center.x * scale, -box.min.y * scale - 1.9, -center.z * scale);
        }

        clone.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.envMapIntensity = 2.6;
              if (child.material.map) {
                child.material.map.anisotropy = 16;
                child.material.map.needsUpdate = true;
              }
              if (child.material.normalMap) {
                child.material.normalMap.anisotropy = 16;
                child.material.normalMap.needsUpdate = true;
              }
              if (child.material.roughnessMap) {
                child.material.roughnessMap.anisotropy = 16;
                child.material.roughness = 0.35;
              }
              if (child.material.metalnessMap) {
                child.material.metalnessMap.anisotropy = 16;
                child.material.metalness = 0.85;
              }
              if (mode === 'WIREFRAME') {
                child.material.wireframe = true;
              } else if (mode === 'XRAY') {
                child.material.transparent = true;
                child.material.opacity = 0.45;
              }
              child.material.needsUpdate = true;
            }
          }
        });

        this.modelRoot.add(clone);

        if (gltf.animations && gltf.animations.length > 0 && THREE.AnimationMixer) {
          this.activeMixer = new THREE.AnimationMixer(clone);
          const action = this.activeMixer.clipAction(gltf.animations[0]);
          action.play();
        }

        this.currentModelObj = {
          root: clone,
          isGLTF: true,
          mixer: this.activeMixer,
          recoilObj: clone
        };
      };

      // Check cache first
      if (this.gltfCache[url]) {
        attachGLTF(this.gltfCache[url]);
        return;
      }

      // AndroidBridge direct Base64 stream support
      if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.getModelBase64 === 'function') {
        try {
          const filename = url.split('/').pop();
          const b64 = window.AndroidBridge.getModelBase64(filename);
          if (b64 && b64.length > 1000) {
            const bin = (typeof atob !== 'undefined') ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            const loader = new THREE.GLTFLoader();
            loader.parse(bytes.buffer, '', (gltf) => {
              this.gltfCache[url] = gltf;
              attachGLTF(gltf);
            }, (e) => {
              if (fallbackFn) fallbackFn();
            });
            return;
          }
        } catch(e) {}
      }

      // Node.js test environment support
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        try {
          const fs = require('fs');
          const path = require('path');
          const fullPath = path.resolve(url);
          if (fs.existsSync(fullPath)) {
            const buf = fs.readFileSync(fullPath);
            const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            const loader = new THREE.GLTFLoader();
            loader.parse(ab, '', (gltf) => {
              this.gltfCache[url] = gltf;
              attachGLTF(gltf);
            }, (e) => {
              if (fallbackFn) fallbackFn();
            });
            return;
          }
        } catch(e) {}
      }

      // Standard browser fetch with graceful fallback
      const loader = new THREE.GLTFLoader();
      try {
        loader.load(url, (gltf) => {
          this.gltfCache[url] = gltf;
          attachGLTF(gltf);
        }, undefined, (err) => {
          if (fallbackFn) fallbackFn();
        });
      } catch (err) {
        if (fallbackFn) fallbackFn();
      }
    }

    cycleLightingPreset() {
      this.lightPresetIdx = ((this.lightPresetIdx || 0) + 1) % 4;
      this.applyLightingPreset();
      return this.getLightingPresetName();
    }

    getLightingPresetName() {
      const names = ['CS2 HANGAR', 'NEON KIBERPANK', "CHO'L POLIGONI", 'GIGANT VOID'];
      return names[this.lightPresetIdx || 0];
    }

    applyLightingPreset() {
      const presets = [
        { name: 'CS2 HANGAR', keyCol: 0xfff4e6, keyI: 2.6, fillCol: 0x406085, fillI: 1.2, rimC: 0x00e5ff, rimM: 0xff007f, hemiSky: 0x7fb8ff, hemiGrd: 0x09101c },
        { name: 'NEON KIBERPANK', keyCol: 0x00f0ff, keyI: 2.4, fillCol: 0x6b21a8, fillI: 1.6, rimC: 0xffd600, rimM: 0xff0077, hemiSky: 0x00f0ff, hemiGrd: 0x1f0733 },
        { name: "CHO'L POLIGONI", keyCol: 0xffeedd, keyI: 3.4, fillCol: 0x64748b, fillI: 1.0, rimC: 0xf59e0b, rimM: 0x38bdf8, hemiSky: 0xffedd5, hemiGrd: 0x431407 },
        { name: 'GIGANT VOID', keyCol: 0xc084fc, keyI: 2.5, fillCol: 0x1e1b4b, fillI: 1.4, rimC: 0x7c3aed, rimM: 0x06b6d4, hemiSky: 0x581c87, hemiGrd: 0x030712 }
      ];
      const p = presets[this.lightPresetIdx || 0];
      if (this.keyLight) { this.keyLight.color.setHex(p.keyCol); this.keyLight.intensity = p.keyI; }
      if (this.fillLight) { this.fillLight.color.setHex(p.fillCol); this.fillLight.intensity = p.fillI; }
      if (this.rimCyan) { this.rimCyan.color.setHex(p.rimC); }
      if (this.rimMagenta) { this.rimMagenta.color.setHex(p.rimM); }
      if (this.hemiLight) { this.hemiLight.color.setHex(p.hemiSky); this.hemiLight.groundColor.setHex(p.hemiGrd); }
    }

    init() {
      if (this.renderer) return;
      const THREE = window.THREE;
      if (!THREE) return;

      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
      } catch(e) {
        console.warn('Codex 3D WebGL context creation failed:', e);
        return;
      }

      this.renderer.setSize(this.width, this.height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
      if (THREE.ACESFilmicToneMapping) this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.35;
      this.renderer.shadowMap.enabled = true;
      if (THREE.PCFSoftShadowMap) this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(38, this.width / this.height, 0.1, 100);
      this.camera.position.set(0, 1.8, 7.8);
      this.camera.lookAt(0, 0, 0);

      // Studio 3-Point Lighting Rig
      this.hemiLight = new THREE.HemisphereLight(0x7fb8ff, 0x09101c, 0.65);
      this.scene.add(this.hemiLight);

      this.keyLight = new THREE.DirectionalLight(0xfff4e6, 2.6);
      this.keyLight.position.set(6, 9, 7);
      this.keyLight.castShadow = true;
      this.keyLight.shadow.mapSize.set(1024, 1024);
      this.scene.add(this.keyLight);

      this.fillLight = new THREE.DirectionalLight(0x406085, 1.2);
      this.fillLight.position.set(-7, 4, 5);
      this.scene.add(this.fillLight);

      this.rimCyan = new THREE.PointLight(0x00e5ff, 28, 22);
      this.rimCyan.position.set(-5, 3.5, -4.5);
      this.scene.add(this.rimCyan);

      this.rimMagenta = new THREE.PointLight(0xff007f, 22, 20);
      this.rimMagenta.position.set(5, 2.5, -5);
      this.scene.add(this.rimMagenta);

      this.mats = new CodexMaterialLibrary(THREE);
      this.factory = new Codex3DModelFactory(THREE, this.mats);

      this.modelRoot = new THREE.Group();
      this.scene.add(this.modelRoot);

      this.active = true;
    }

    loadUnit(id, tab = 'TOWERS', branch = 'BASE', mode = 'SHADED') {
      if (!this.active || !this.factory) return;
      if (this.currentId === id && this.currentTab === tab && this.currentBranch === branch && this.renderMode === mode) {
        return;
      }

      this.currentId = id;
      this.currentTab = tab;
      this.currentBranch = branch;
      this.renderMode = mode;

      if (this.activeMixer) {
        this.activeMixer.stopAllAction();
        this.activeMixer = null;
      }

      // Clear previous model
      while (this.modelRoot.children.length > 0) {
        const obj = this.modelRoot.children[0];
        this.modelRoot.remove(obj);
      }

      // Add Platform base
      this.factory.createPlatform(this.modelRoot, mode);

      // Build specific unit procedural fallback
      const F = this.factory;
      const R = this.modelRoot;

      const fallbackFn = () => {
        switch(id) {
          // Towers
          case 'pulse': this.currentModelObj = F.buildPulseTower(R, mode, branch); break;
          case 'mortar': this.currentModelObj = F.buildMortarTower(R, mode); break;
          case 'cryo': this.currentModelObj = F.buildCryoTower(R, mode); break;
          case 'tesla': this.currentModelObj = F.buildTeslaTower(R, mode); break;
          case 'flame': this.currentModelObj = F.buildFlameTower(R, mode); break;
          case 'railgun': this.currentModelObj = F.buildRailgunTower(R, mode); break;
          case 'beacon': this.currentModelObj = F.buildBeaconTower(R, mode); break;
          case 'barricade': this.currentModelObj = F.buildBarricade(R, mode); break;

          // Enemies
          case 'grunt': this.currentModelObj = F.buildGrunt(R, mode); break;
          case 'sprinter': this.currentModelObj = F.buildSprinter(R, mode); break;
          case 'brute': this.currentModelObj = F.buildBrute(R, mode); break;
          case 'shieldbearer': this.currentModelObj = F.buildShieldbearer(R, mode); break;
          case 'medic': this.currentModelObj = F.buildMedic(R, mode); break;
          case 'splitter': this.currentModelObj = F.buildSplitter(R, mode); break;
          case 'phantom': this.currentModelObj = F.buildPhantom(R, mode); break;
          case 'kamikaze_drone': this.currentModelObj = F.buildKamikazeDrone(R, mode); break;
          case 'gunship': this.currentModelObj = F.buildGunship(R, mode); break;

          // Boss Titans
          case 'juggernaut': this.currentModelObj = F.buildJuggernaut(R, mode); break;
          case 'overseer': this.currentModelObj = F.buildOverseer(R, mode); break;
          case 'hive_titan': this.currentModelObj = F.buildHiveTitan(R, mode); break;
          case 'void_titan': this.currentModelObj = F.buildVoidTitan(R, mode); break;
          case 'chrono_phantom': this.currentModelObj = F.buildChronoPhantom(R, mode); break;
          case 'mecha_colossus': this.currentModelObj = F.buildMechaColossus(R, mode); break;

          // Hero Mech
          case 'megatron':
          case 'optimus':
          case 'bumblebee':
          case 'biped': this.currentModelObj = F.buildApexBiped(R, mode); break;
          case 'siege': this.currentModelObj = F.buildApexSiege(R, mode); break;

          default:
            this.currentModelObj = F.buildPulseTower(R, mode, branch);
            break;
        }
      };

      // If Sketchfab 3D GLTF asset exists for this unit, load it!
      if (this.modelMap[id]) {
        fallbackFn();
        this.loadGLTFModel(this.modelMap[id], id, mode, branch, fallbackFn);
      } else {
        fallbackFn();
      }
    }

    update(dt, yaw, pitch, zoom, recoil = 0) {
      if (!this.active) return;
      this.time += dt;
      this.yaw = yaw;
      this.pitch = pitch;
      this.zoom = zoom;
      this.recoil = recoil;

      // Update Camera & Orbit
      const dist = 7.8 / Math.max(0.4, zoom);
      const camY = 1.4 + Math.sin(pitch) * dist * 0.7;
      const camZ = Math.cos(pitch) * dist;

      this.camera.position.set(0, camY, camZ);
      this.camera.lookAt(0, 0.1, 0);

      // Rotate root model
      if (this.modelRoot) {
        this.modelRoot.rotation.y = yaw;

        // Animate sub-components
        const m = this.currentModelObj;
        if (m) {
          if (m.mechInstance && typeof m.mechInstance.update === 'function') {
            m.mechInstance.update(dt);
          }
          if (m.isHover && m.drone) {
            m.drone.position.y = 0.2 + Math.sin(this.time * 2.5) * 0.12;
            if (m.ring1) m.ring1.rotation.z += dt * 1.8;
            if (m.ring2) m.ring2.rotation.y -= dt * 2.2;
          }
          if (m.isOverseer && m.core) {
            m.core.position.y = 0.3 + Math.sin(this.time * 1.8) * 0.15;
            if (m.ringA) m.ringA.rotation.z += dt * 0.9;
            if (m.ringB) m.ringB.rotation.y -= dt * 1.2;
            if (m.ringC) m.ringC.rotation.x += dt * 0.8;
          }
          if (m.isVoid && m.voidCore) {
            if (m.disk1) m.disk1.rotation.z += dt * 1.5;
            if (m.disk2) m.disk2.rotation.z -= dt * 1.1;
            if (m.obelisks) {
              for (let i = 0; i < m.obelisks.length; i++) {
                const ob = m.obelisks[i];
                const ang = (i * Math.PI) / 2 + this.time * 0.8;
                ob.position.set(Math.cos(ang) * 2.6, 0.2 + Math.sin(this.time * 3 + i) * 0.2, Math.sin(ang) * 2.6);
                ob.rotation.y += dt * 2;
              }
            }
          }
          if (m.isChrono && m.chronoCore) {
            m.chronoCore.rotation.y += dt * 0.8;
            m.chronoCore.rotation.x += dt * 0.5;
            if (m.dialA) m.dialA.rotation.z += dt * 1.4;
            if (m.dialB) m.dialB.rotation.x -= dt * 1.1;
          }
          if (m.isCluster && m.satellites) {
            for (let i = 0; i < m.satellites.length; i++) {
              const sat = m.satellites[i];
              const a = (i * Math.PI) / 2 + this.time * 1.4;
              sat.position.set(Math.cos(a) * 1.5, 0.2 + Math.sin(this.time * 2 + i) * 0.25, Math.sin(a) * 1.5);
              sat.rotation.x += dt * 2.0;
            }
          }
          if (m.isGunship && m.rotors) {
            for (const r of m.rotors) r.rotation.y += dt * 35.0;
            if (m.hull) m.hull.position.y = 0.3 + Math.sin(this.time * 3) * 0.08;
          }
          if (m.dish) {
            m.dish.rotation.y += dt * (m.rotSpeed || 1.0);
          }

          // Biped Soldier Walk Kinematics (Grunt)
          if (m.isBiped) {
            const wSpeed = 5.2;
            if (m.legR) m.legR.rotation.x = Math.sin(this.time * wSpeed) * 0.42;
            if (m.legL) m.legL.rotation.x = -Math.sin(this.time * wSpeed) * 0.42;
            if (m.armR) m.armR.rotation.x = -Math.sin(this.time * wSpeed) * 0.32;
            if (m.armL) m.armL.rotation.x = Math.sin(this.time * wSpeed) * 0.32;
            if (m.torso) m.torso.position.y = 0.4 + Math.abs(Math.sin(this.time * wSpeed * 2)) * 0.04;
          }

          // Sprinter Raptor Leaping Kinematics
          if (m.isSprinter && m.body) {
            const sSpeed = 8.5;
            m.body.position.y = 0.1 + Math.abs(Math.sin(this.time * sSpeed)) * 0.16;
            m.body.rotation.z = Math.sin(this.time * sSpeed) * 0.07;
            if (m.head) m.head.rotation.x = Math.sin(this.time * sSpeed) * 0.12;
          }

          // Brute Heavy Stomping Kinematics
          if (m.isBrute && m.torso) {
            const bSpeed = 3.4;
            m.torso.position.y = 0.4 + Math.abs(Math.sin(this.time * bSpeed)) * 0.08;
            m.torso.rotation.z = Math.sin(this.time * bSpeed) * 0.05;
          }

          // Mecha Colossus Macro Reactor Breathing
          if (m.isColossus && m.torso) {
            m.torso.position.y = 0.6 + Math.sin(this.time * 2.0) * 0.05;
          }

          // Hive Titan Biological Crawl
          if (m.isHive && m.body) {
            m.body.position.y = 0.2 + Math.sin(this.time * 2.6) * 0.06;
          }

          // Turret Autonomous Aim Scanning
          if (m.head && m.rotSpeed) {
            m.head.rotation.y = Math.sin(this.time * 0.6) * 0.35;
          }

          // Recoil kickback and smooth hydraulic recovery
          const rObj = m.barrels || m.barrel || m.rails || m.guns || m.nozzles;
          if (rObj) {
            if (rObj._origZ === undefined) rObj._origZ = rObj.position.z;
            if (recoil > 0) {
              rObj.position.z = rObj._origZ - recoil * 0.45;
            } else if (rObj.position.z < rObj._origZ) {
              rObj.position.z = Math.min(rObj._origZ, rObj.position.z + dt * 3.5);
            }
          }

          // Real 3D GLTF recoil and animation
          if (m.isGLTF && m.recoilObj) {
            const ro = m.recoilObj;
            if (ro._origZ === undefined) ro._origZ = ro.position.z;
            if (recoil > 0) {
              ro.position.z = ro._origZ - recoil * 0.35;
            } else if (ro.position.z < ro._origZ) {
              ro.position.z = Math.min(ro._origZ, ro.position.z + dt * 3.5);
            }
          }
        }
      }

      if (this.activeMixer) {
        this.activeMixer.update(dt);
      }

      // Render Three.js frame
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }
  }

  window.Codex3DEngine = Codex3DEngine;
})();

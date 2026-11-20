// =============================================================================
// APEX-01 Mech System (Three.js Procedural Mech Renderer)
// Ported from apex01_mech_v2.html for Tower Defense: Last Grid
// Features: Full procedural rig, digitigrade legs, hydraulic pistons, reactor core,
//           missile pod, radar dish, dual cannons, thruster flames, idle breathing,
//           drag-to-rotate, tap-to-strike, dash boost, and orbital ULT death beam.
// =============================================================================

(function() {
  'use strict';

  if (typeof window === 'undefined') return;

  function createProceduralTextures(THREE) {
    let _seed = 1234567;
    const rnd = () => {
      _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0;
      let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    function metalCanvas(base, size = 256) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      g.fillStyle = base; g.fillRect(0, 0, size, size);
      const img = g.getImageData(0, 0, size, size), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (rnd() - 0.5) * 20;
        d[i] += n; d[i+1] += n; d[i+2] += n;
      }
      g.putImageData(img, 0, 0);
      for (let i = 0; i < 18; i++) {
        const x = rnd() * size, y = rnd() * size, w = 30 + rnd() * 90, h = 25 + rnd() * 70;
        g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.15)';
        g.fillRect(x, y, w, h);
        g.lineWidth = 1.5; g.strokeStyle = 'rgba(0,0,0,0.55)'; g.strokeRect(x, y, w, h);
        g.strokeStyle = 'rgba(255,255,255,0.15)'; g.strokeRect(x + 1, y + 1, w, h);
      }
      for (let i = 0; i < 40; i++) {
        g.strokeStyle = 'rgba(220,235,255,' + (0.05 + rnd() * 0.12) + ')';
        g.lineWidth = 1;
        const x = rnd() * size, y = rnd() * size;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 45, y + (rnd() - 0.5) * 15); g.stroke();
      }
      return c;
    }

    function hazardCanvas() {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d');
      g.fillStyle = '#e0b100'; g.fillRect(0, 0, 128, 128);
      g.fillStyle = '#12151b';
      for (let i = -128; i < 256; i += 32) {
        g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 16, 0); g.lineTo(i + 144, 128); g.lineTo(i + 128, 128); g.closePath(); g.fill();
      }
      g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 3; g.strokeRect(0, 0, 128, 128);
      return c;
    }

    function decalCanvas(txt) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 146;
      const g = c.getContext('2d');
      g.fillStyle = 'rgba(8,12,20,0.6)'; g.fillRect(0, 0, 256, 146);
      g.strokeStyle = '#e9f7ff'; g.lineWidth = 6; g.strokeRect(6, 6, 244, 134);
      g.fillStyle = '#e9f7ff'; g.font = 'bold 78px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(txt, 128, 80);
      return c;
    }

    function makeTex(can, rx = 1, ry = 1) {
      const t = new THREE.CanvasTexture(can);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      return t;
    }

    return {
      tA: makeTex(metalCanvas('#3d4d70')),
      tB: makeTex(metalCanvas('#2b313c')),
      tC: makeTex(metalCanvas('#8c2058')),
      tH: makeTex(hazardCanvas(), 2, 2),
      tD: makeTex(decalCanvas('A-01'))
    };
  }

  class Apex01Mech {
    constructor(THREE) {
      this.THREE = THREE;
      const tex = createProceduralTextures(THREE);
      const std = o => new THREE.MeshStandardMaterial(o);

      this.M = {
        armor:  std({ map: tex.tA, color: 0xffffff, metalness: 0.7, roughness: 0.42 }),
        armor2: std({ map: tex.tB, color: 0xffffff, metalness: 0.75, roughness: 0.45 }),
        accent: std({ map: tex.tC, color: 0xffffff, metalness: 0.55, roughness: 0.4 }),
        hazard: std({ map: tex.tH, color: 0xffffff, metalness: 0.2, roughness: 0.6 }),
        dark:   std({ color: 0x0b0e14, metalness: 0.35, roughness: 0.78 }),
        chrome: std({ color: 0xd5dde8, metalness: 1.0, roughness: 0.18 }),
        barrel: std({ color: 0x2c333f, metalness: 0.95, roughness: 0.28 }),
        trim:   std({ color: 0x06222b, emissive: 0x2ee6ff, emissiveIntensity: 2.0, metalness: 0.3, roughness: 0.4 }),
        pinkEm: std({ color: 0x2a0614, emissive: 0xff2a8a, emissiveIntensity: 2.0, metalness: 0.3, roughness: 0.4 }),
        vent:   std({ color: 0x2a0a00, emissive: 0xff6a1a, emissiveIntensity: 1.2, metalness: 0.2, roughness: 0.6 }),
        heat:   std({ color: 0x2a0a00, emissive: 0xff7a2a, emissiveIntensity: 0.6, metalness: 0.2, roughness: 0.5 }),
        glass:  std({ color: 0x0a2a3a, emissive: 0x1fb8d8, emissiveIntensity: 0.7, metalness: 0.9, roughness: 0.05, transparent: true, opacity: 0.7 }),
        core:   new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 2.6, 3.0) }),
        decal:  std({ map: tex.tD, transparent: true, roughness: 0.6, metalness: 0.2 }),
        flame:  new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 1.6, 2.4), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
        flame2: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.8, 3.0), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
        tracer: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 3.0, 3.4) })
      };
      this.M.dish = this.M.armor2.clone();
      this.M.dish.side = THREE.DoubleSide;
      this.FLASH_MATS = [this.M.armor, this.M.armor2, this.M.accent];

      this.root = new THREE.Group();
      this.body = new THREE.Group();
      this.root.add(this.body);

      this.legs = [];
      this.arms = [];
      this.flames = [];
      this.projs = [];
      this.particles = [];

      this.buildModel();
      this.buildEffects();

      // State
      this.t = 0;
      this.shake = 0;
      this.hitT = 0;
      this.dashT = -1;
      this.ultT = -1;
      this.fireArm = 0;
      this.yaw = 0;
      this.yawVel = 0;
      this.walking = false;
      this.walkBlend = 0;
      this.phase = 0;
      this.heat = 0;
      this.ultCharge = 0;
    }

    put(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
      const m = new this.THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      parent.add(m);
      return m;
    }

    buildModel() {
      const T = this.THREE;
      const M = this.M;
      const box = (w, h, d) => new T.BoxGeometry(w, h, d);
      const cy = (rt, rb, h, seg = 16) => new T.CylinderGeometry(rt, rb, h, seg);
      const tor = (r, t, seg = 20) => new T.TorusGeometry(r, t, 8, seg);
      const sph = r => new T.SphereGeometry(r, 16, 12);

      // --- Platform ---
      this.platform = new T.Group();
      this.root.add(this.platform);
      this.put(this.platform, cy(3.7, 3.9, 0.3, 8), M.armor2, 0, -0.15, 0);
      this.put(this.platform, tor(3.3, 0.05, 48), M.trim, 0, 0.02, 0, Math.PI / 2, 0, 0);
      this.put(this.platform, tor(2.4, 0.04, 48), M.pinkEm, 0, 0.02, 0, Math.PI / 2, 0, 0);
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + Math.PI / 8, cx = Math.cos(a), sz = Math.sin(a);
        this.put(this.platform, box(0.25, 0.5, 0.25), M.dark, cx * 3.75, 0.2, sz * 3.75);
        this.put(this.platform, sph(0.07), M.trim, cx * 3.75, 0.52, sz * 3.75);
        this.put(this.platform, box(1.2, 0.04, 0.25), M.hazard, cx * 3.45, 0.02, sz * 3.45, 0, -a + Math.PI / 2, 0);
      }

      // --- Pelvis ---
      this.pelvis = new T.Group();
      this.body.add(this.pelvis);
      this.put(this.pelvis, box(1.9, 0.55, 1.25), M.armor2, 0, 2.55, 0);
      this.put(this.pelvis, box(1.3, 0.35, 0.9), M.dark, 0, 2.25, 0);
      this.put(this.pelvis, box(0.8, 0.7, 0.1), M.armor, 0, 2.15, 0.68, 0.25, 0, 0);
      this.put(this.pelvis, box(0.8, 0.7, 0.1), M.armor, 0, 2.15, -0.68, -0.25, 0, 0);
      this.put(this.pelvis, box(0.5, 0.06, 0.2), M.hazard, 0, 2.5, 0.66);
      [-1, 1].forEach(s => {
        this.put(this.pelvis, box(0.12, 0.65, 0.9), M.armor, s * 1.0, 2.2, 0, 0, 0, s * 0.15);
        this.put(this.pelvis, cy(0.34, 0.34, 0.62, 16), M.dark, s * 0.72, 2.3, 0, 0, 0, Math.PI / 2);
        this.put(this.pelvis, tor(0.34, 0.035), M.trim, s * 1.05, 2.3, 0, 0, Math.PI / 2, 0);
      });

      // --- Digitigrade Legs ---
      const makeLeg = (s) => {
        const hip = new T.Group();
        hip.position.set(s * 0.72, 2.3, 0);
        hip.rotation.x = -0.45;
        this.body.add(hip);

        this.put(hip, box(0.62, 1.1, 0.7), M.armor, 0, -0.55, 0.02);
        this.put(hip, box(0.5, 0.8, 0.12), M.armor2, 0, -0.5, 0.42, 0.12, 0, 0);
        this.put(hip, box(0.08, 0.7, 0.55), M.accent, s * 0.36, -0.5, 0);
        this.put(hip, box(0.07, 0.26, 0.34), M.hazard, s * 0.37, -0.14, 0.18);
        this.put(hip, cy(0.085, 0.085, 0.5, 10), M.armor2, s * 0.2, -0.3, -0.45);
        this.put(hip, cy(0.045, 0.045, 0.65, 8), M.chrome, s * 0.2, -0.7, -0.45);

        const knee = new T.Group();
        knee.position.set(0, -1.1, 0);
        knee.rotation.x = 0.9;
        hip.add(knee);

        this.put(knee, cy(0.3, 0.3, 0.76, 16), M.dark, 0, 0, 0, 0, 0, Math.PI / 2);
        this.put(knee, tor(0.3, 0.03), M.trim, s * 0.4, 0, 0, 0, Math.PI / 2, 0);
        this.put(knee, box(0.55, 0.5, 0.4), M.armor2, 0, 0.05, 0.38, -0.5, 0, 0);
        this.put(knee, box(0.45, 0.08, 0.3), M.accent, 0, 0.12, 0.52, -0.5, 0, 0);
        this.put(knee, box(0.5, 1.2, 0.55), M.armor, 0, -0.62, -0.05);
        this.put(knee, box(0.44, 0.7, 0.35), M.armor2, 0, -0.45, -0.38);
        this.put(knee, box(0.4, 0.9, 0.1), M.armor2, 0, -0.65, 0.28, 0.1, 0, 0);
        this.put(knee, cy(0.075, 0.075, 0.5, 10), M.armor2, s * 0.2, -0.4, -0.62);
        this.put(knee, cy(0.045, 0.045, 0.55, 8), M.chrome, s * 0.2, -0.85, -0.62);
        this.put(knee, box(0.07, 0.5, 0.4), M.accent, s * 0.28, -0.6, 0);

        const ankle = new T.Group();
        ankle.position.set(0, -1.2, 0);
        ankle.rotation.x = -0.45;
        knee.add(ankle);

        this.put(ankle, cy(0.2, 0.2, 0.62, 14), M.dark, 0, 0, 0, 0, 0, Math.PI / 2);
        this.put(ankle, box(0.7, 0.22, 0.55), M.armor2, 0, -0.11, -0.12);
        [-1, 1].forEach(k => {
          this.put(ankle, box(0.28, 0.2, 0.62), M.armor2, k * 0.2, -0.1, 0.42);
          this.put(ankle, box(0.2, 0.12, 0.14), M.dark, k * 0.2, -0.1, 0.78);
        });
        this.put(ankle, box(0.62, 0.1, 0.9), M.armor, 0, 0.01, 0.12);
        this.put(ankle, box(0.04, 0.03, 0.55), M.trim, 0, 0.07, 0.12);

        this.legs.push({ hip, knee, ankle, s });
      };
      makeLeg(-1);
      makeLeg(1);

      // --- Torso ---
      this.torso = new T.Group();
      this.torso.position.y = 2.85;
      this.body.add(this.torso);

      this.put(this.torso, cy(0.7, 0.7, 0.3, 20), M.dark, 0, 0.02, 0);
      this.put(this.torso, tor(0.7, 0.03, 32), M.trim, 0, 0.17, 0, Math.PI / 2, 0, 0);
      this.put(this.torso, box(1.3, 0.55, 0.95), M.armor2, 0, 0.32, 0);
      this.put(this.torso, box(0.5, 0.3, 0.05), M.hazard, 0, 0.32, 0.5);
      this.put(this.torso, box(2.0, 0.9, 1.25), M.armor, 0, 0.95, 0);
      this.put(this.torso, box(1.5, 0.75, 0.14), M.armor2, 0, 0.95, 0.66, -0.2, 0, 0);
      this.put(this.torso, box(1.8, 0.6, 0.95), M.armor, 0, 1.65, -0.05);
      this.put(this.torso, box(0.3, 0.7, 0.8), M.armor2, -1.1, 1.3, 0);
      this.put(this.torso, box(0.3, 0.7, 0.8), M.armor2, 1.1, 1.3, 0);
      this.put(this.torso, cy(0.2, 0.24, 0.3, 10), M.dark, 0, 2.0, 0);

      // Cockpit Canopy
      this.put(this.torso, new T.SphereGeometry(0.38, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.glass, 0, 1.65, 0.35, Math.PI / 2, 0, 0);
      this.put(this.torso, tor(0.38, 0.05, 24), M.armor2, 0, 1.65, 0.38);
      this.put(this.torso, sph(0.16), M.core, 0, 1.65, 0.42);

      // Chest Vents
      [-1, 1].forEach(s => {
        this.put(this.torso, box(0.45, 0.4, 0.06), M.dark, s * 0.7, 1.65, 0.43);
        for (let i = 0; i < 4; i++) {
          this.put(this.torso, box(0.36, 0.04, 0.05), M.vent, s * 0.7, 1.52 + i * 0.09, 0.47);
        }
      });

      // Reactor Core
      this.coreRing = this.put(this.torso, tor(0.22, 0.03), M.trim, 0, 0.78, 0.74);
      this.put(this.torso, sph(0.1), M.core, 0, 0.78, 0.74);

      // Backpack
      this.put(this.torso, box(1.3, 1.2, 0.7), M.armor2, 0, 1.15, -0.95);
      this.put(this.torso, box(1.1, 0.3, 0.6), M.armor, 0, 1.85, -0.95);
      for (let i = 0; i < 4; i++) {
        this.put(this.torso, box(0.9, 0.04, 0.04), M.vent, 0, 1.25 + i * 0.1, -1.32);
      }
      [-1, 1].forEach(s => {
        this.put(this.torso, cy(0.06, 0.06, 0.9, 8), M.chrome, s * 0.55, 1.3, -1.34);
      });
      this.put(this.torso, cy(0.015, 0.015, 0.9, 6), M.chrome, 0.62, 2.35, -1.0);
      this.put(this.torso, sph(0.04), M.pinkEm, 0.62, 2.8, -1.0);
      this.put(this.torso, cy(0.012, 0.012, 0.6, 6), M.chrome, -0.62, 2.2, -1.0);

      // Twin Thrusters & Animated Flames
      [-0.45, 0.45].forEach(x => {
        this.put(this.torso, cy(0.2, 0.3, 0.5, 16), M.dark, x, 0.95, -1.45, Math.PI / 2, 0, 0);
        this.put(this.torso, tor(0.29, 0.03), M.trim, x, 0.95, -1.7);
        const w = new T.Group();
        w.position.set(x, 0.95, -1.72);
        this.torso.add(w);

        const o = new T.Mesh(new T.ConeGeometry(0.25, 1.4, 14, 1, true), M.flame);
        o.rotation.x = -Math.PI / 2; o.position.z = -0.7; w.add(o);

        const i2 = new T.Mesh(new T.ConeGeometry(0.12, 0.9, 10, 1, true), M.flame2);
        i2.rotation.x = -Math.PI / 2; i2.position.z = -0.45; w.add(i2);

        this.flames.push(w);
      });

      // --- Head ---
      this.head = new T.Group();
      this.head.position.set(0, 2.25, 0.05);
      this.torso.add(this.head);

      this.put(this.head, box(0.62, 0.45, 0.7), M.armor, 0, 0, 0);
      this.put(this.head, box(0.5, 0.09, 0.12), M.trim, 0, 0.04, 0.34);
      this.put(this.head, box(0.4, 0.18, 0.1), M.armor2, 0, -0.1, 0.34);
      this.put(this.head, box(0.12, 0.18, 0.6), M.accent, 0, 0.28, -0.05);
      [-1, 1].forEach(s => {
        this.put(this.head, box(0.12, 0.22, 0.3), M.armor2, s * 0.36, 0, -0.02);
        this.put(this.head, sph(0.05), M.trim, s * 0.42, 0.05, 0.14);
        this.put(this.head, cy(0.012, 0.012, 0.5, 6), M.chrome, s * 0.26, 0.45, -0.2, -0.2, 0, 0);
      });

      // --- Arms & Weapon Systems ---
      const makeArm = (s) => {
        const sh = new T.Group();
        sh.position.set(s * 1.45, 1.5, 0);
        sh.rotation.x = -0.5;
        this.torso.add(sh);

        this.put(sh, box(0.9, 0.7, 1.1), M.accent, s * 0.12, 0.2, 0);
        this.put(sh, box(0.95, 0.16, 1.15), M.armor2, s * 0.12, 0.6, 0);
        this.put(sh, box(0.7, 0.06, 0.3), M.hazard, s * 0.12, 0.7, 0.4);
        this.put(sh, new T.PlaneGeometry(0.7, 0.4), M.decal, s * 0.58, 0.2, -0.1, 0, s * Math.PI / 2, 0);
        this.put(sh, sph(0.3), M.dark, 0, -0.15, 0);
        this.put(sh, box(0.4, 0.8, 0.45), M.armor2, 0, -0.65, 0);
        this.put(sh, cy(0.05, 0.05, 0.6, 8), M.chrome, s * 0.24, -0.6, 0.18);

        const elbow = new T.Group();
        elbow.position.set(0, -1.1, 0);
        elbow.rotation.x = 0.5;
        sh.add(elbow);

        this.put(elbow, cy(0.24, 0.24, 0.52, 14), M.dark, 0, 0, 0, 0, 0, Math.PI / 2);
        this.put(elbow, box(0.55, 0.55, 1.0), M.armor, 0, 0, 0.5);
        this.put(elbow, box(0.4, 0.05, 0.3), M.hazard, 0, 0.3, 0.7);
        this.put(elbow, box(0.42, 0.42, 0.8), M.armor2, 0, -0.02, 1.2);
        for (let i = 0; i < 4; i++) {
          this.put(elbow, box(0.46, 0.3, 0.03), M.armor2, 0, 0, 1.45 + i * 0.1);
        }
        this.put(elbow, cy(0.2, 0.2, 0.45, 14), M.armor2, 0, 0.4, 0.6, 0, 0, Math.PI / 2);
        this.put(elbow, tor(0.2, 0.025, 16), M.trim, s * 0.24, 0.4, 0.6, 0, Math.PI / 2, 0);
        this.put(elbow, box(0.05, 0.05, 0.3), M.pinkEm, 0, -0.3, 1.5);

        const barrels = new T.Group();
        elbow.add(barrels);
        this.put(barrels, box(0.46, 0.28, 0.5), M.armor, 0, 0.02, 1.65);
        [-0.13, 0.13].forEach(bx => {
          this.put(barrels, cy(0.075, 0.075, 1.0, 12), M.barrel, bx, 0.02, 1.9, Math.PI / 2, 0, 0);
          this.put(barrels, cy(0.1, 0.09, 0.2, 12), M.dark, bx, 0.02, 2.5, Math.PI / 2, 0, 0);
          this.put(barrels, tor(0.085, 0.022, 14), M.heat, bx, 0.02, 2.3);
        });

        const muzzles = [-0.13, 0.13].map(bx => {
          const o = new T.Object3D();
          o.position.set(bx, 0.02, 2.62);
          barrels.add(o);
          return o;
        });

        const armObj = { sh, elbow, barrels, muzzles, s, recoil: 0 };
        this.arms.push(armObj);
        return armObj;
      };

      const armL = makeArm(-1);
      const armR = makeArm(1);

      // Right Shoulder: Missile Pod
      const pod = new T.Group();
      pod.position.set(0.15, 0.95, -0.05);
      armR.sh.add(pod);
      this.put(pod, box(0.8, 0.55, 1.0), M.armor2, 0, 0, 0);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          const px = -0.25 + i * 0.25, py = -0.12 + j * 0.24;
          this.put(pod, cy(0.085, 0.085, 0.5, 10), M.dark, px, py, 0.5, Math.PI / 2, 0, 0);
          this.put(pod, tor(0.085, 0.015, 10), M.accent, px, py, 0.76);
          this.put(pod, new T.ConeGeometry(0.065, 0.18, 8), M.pinkEm, px, py, 0.66, Math.PI / 2, 0, 0);
        }
      }

      // Left Shoulder: Radar Dish
      this.dish = new T.Group();
      this.dish.position.set(-0.1, 0.65, -0.1);
      armL.sh.add(this.dish);
      this.put(this.dish, cy(0.04, 0.05, 0.5, 8), M.chrome, 0, 0.25, 0);
      this.put(this.dish, new T.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.dish, 0, 0.58, 0, Math.PI * 0.8, 0, 0);
      this.put(this.dish, cy(0.015, 0.015, 0.3, 6), M.chrome, 0, 0.72, 0.12, Math.PI / 3, 0, 0);
      this.put(this.dish, sph(0.04), M.pinkEm, 0, 0.84, 0.24);
    }

    buildEffects() {
      const T = this.THREE;
      // Projectiles pool
      for (let i = 0; i < 20; i++) {
        const p = new T.Mesh(new T.SphereGeometry(0.07, 6, 6), this.M.tracer);
        p.scale.z = 7;
        p.visible = false;
        p.userData = { life: 0, vel: new T.Vector3() };
        this.root.add(p);
        this.projs.push(p);
      }

      // Orbital Beam for ULT
      this.beam = new T.Mesh(
        new T.CylinderGeometry(0.45, 0.45, 18, 16, 1, true),
        new T.MeshBasicMaterial({
          color: new T.Color(3.0, 2.2, 0.6),
          transparent: true,
          opacity: 0.85,
          blending: T.AdditiveBlending,
          side: T.DoubleSide,
          depthWrite: false
        })
      );
      this.beam.position.y = 9;
      this.beam.visible = false;
      this.root.add(this.beam);

      this.ultRing = new T.Mesh(
        new T.RingGeometry(0.3, 0.5, 32),
        new T.MeshBasicMaterial({
          color: new T.Color(3.0, 2.2, 0.6),
          transparent: true,
          opacity: 0.8,
          side: T.DoubleSide,
          blending: T.AdditiveBlending,
          depthWrite: false
        })
      );
      this.ultRing.rotation.x = -Math.PI / 2;
      this.ultRing.position.y = 0.04;
      this.ultRing.visible = false;
      this.root.add(this.ultRing);
    }

    fire() {
      const a = this.arms[this.fireArm];
      this.fireArm = 1 - this.fireArm;
      a.recoil = 1;
      this.heat = Math.min(1, this.heat + 0.2);
      this.shake = Math.max(this.shake, 0.05);

      const tmp = new this.THREE.Vector3();
      a.muzzles.forEach(m => {
        m.getWorldPosition(tmp);
        const p = this.projs.find(x => !x.visible);
        if (!p) return;
        p.position.copy(tmp);
        p.quaternion.copy(this.root.quaternion);
        p.userData.vel.set(0, 0, 26).applyQuaternion(this.root.quaternion);
        p.userData.life = 0.8;
        p.visible = true;
      });
    }

    dash() {
      if (this.dashT < 0) this.dashT = 0;
    }

    ult() {
      if (this.ultT < 0) this.ultT = 0;
    }

    hit() {
      this.hitT = 0.25;
      this.shake = Math.max(this.shake, 0.18);
      this.FLASH_MATS.forEach(m => {
        m.emissive.set(0xff1515);
        m.emissiveIntensity = 1.4;
      });
    }

    update(dt) {
      this.t += dt;
      this.walkBlend += ((this.walking ? 1 : 0) - this.walkBlend) * Math.min(1, dt * 4);
      this.phase += dt * 5.2 * this.walkBlend;
      const idle = Math.sin(this.t * 1.7);

      // Legs floor gait
      let minFoot = 1e9;
      this.legs.forEach(l => {
        const ph = this.phase + (l.s > 0 ? 0 : Math.PI);
        const sw = Math.sin(ph) * this.walkBlend, lift = Math.max(0, Math.cos(ph)) * this.walkBlend;
        const a1 = -0.45 + sw * 0.42 + idle * 0.008 * l.s;
        const a2 = 0.9 + lift * 0.75;
        l.hip.rotation.x = a1; l.knee.rotation.x = a2; l.ankle.rotation.x = -(a1 + a2);
        const f = 2.3 - 1.1 * Math.cos(a1) - 1.2 * Math.cos(a1 + a2) - 0.22;
        if (f < minFoot) minFoot = f;
      });

      const DASH_TIME = 0.45;
      const dashK = this.dashT >= 0 ? Math.sin(Math.PI * Math.min(this.dashT / DASH_TIME, 1)) : 0;
      this.body.position.y = -minFoot + idle * 0.012;
      this.body.rotation.z = Math.sin(this.phase) * 0.035 * this.walkBlend - 0.22 * dashK;

      // Torso & Head
      this.torso.rotation.y = Math.sin(this.t * 0.5) * 0.12 * (1 - this.walkBlend) + Math.sin(this.phase) * 0.1 * this.walkBlend;
      this.head.rotation.y = -this.torso.rotation.y * 0.6 + Math.sin(this.t * 0.9) * 0.12;

      // Arms & Cannons
      this.arms.forEach(a => {
        a.recoil = Math.max(0, a.recoil - dt * 3);
        a.sh.rotation.x = -0.5 - a.recoil * 0.14 + idle * 0.01 - Math.sin(this.phase + (a.s > 0 ? Math.PI : 0)) * 0.18 * this.walkBlend;
        a.sh.rotation.y = a.s * 0.05;
        a.barrels.position.z = -a.recoil * 0.28;
      });

      // Emissive reactor core & heat vents
      this.heat = Math.max(0, this.heat - dt * 0.45);
      this.M.heat.emissiveIntensity = 0.6 + this.heat * 4.0 + Math.sin(this.t * 3) * 0.1;
      this.M.vent.emissiveIntensity = 1.0 + Math.sin(this.t * 2.3) * 0.35 + this.heat * 1.2 + this.ultCharge * 2.0;
      this.M.trim.emissiveIntensity = 2.0 + Math.sin(this.t * 4) * 0.4 + this.ultCharge * 1.5;
      this.coreRing.rotation.z += dt * (1.5 + this.ultCharge * 12);
      if (this.dish) this.dish.rotation.y = this.t * 0.9;

      // Thruster flame boost
      const boost = 1 + dashK * 1.4 + this.walkBlend * 0.1;
      this.flames.forEach(w => w.scale.set(1, 1, (0.85 + Math.random() * 0.3) * boost));

      // Dash
      if (this.dashT >= 0) {
        this.dashT += dt;
        const k = Math.min(this.dashT / DASH_TIME, 1);
        const off = Math.sin(Math.PI * k) * 2.4;
        this.root.position.x = Math.sin(this.yaw) * off;
        this.root.position.z = Math.cos(this.yaw) * off;
        if (k >= 1) {
          this.dashT = -1;
          this.root.position.set(0, 0, 0);
        }
      }

      // Hit Flash recovery
      if (this.hitT > 0) {
        this.hitT -= dt;
        const k = Math.max(0, this.hitT / 0.25);
        this.FLASH_MATS.forEach(m => {
          m.emissiveIntensity = k * 1.4;
          if (this.hitT <= 0) m.emissive.set(0x000000);
        });
      }

      // Projectiles
      this.projs.forEach(p => {
        if (!p.visible) return;
        p.position.addScaledVector(p.userData.vel, dt);
        p.userData.life -= dt;
        if (p.userData.life <= 0) p.visible = false;
      });

      // ULT
      const ULT_CHARGE = 0.6, ULT_FIRE = 1.2;
      if (this.ultT >= 0) {
        this.ultT += dt;
        this.ultCharge = Math.min(this.ultT / ULT_CHARGE, 1);
        if (this.ultT >= ULT_CHARGE) {
          const k = (this.ultT - ULT_CHARGE) / ULT_FIRE;
          this.beam.visible = this.ultRing.visible = true;
          this.beam.position.set(0, 9, 4);
          this.beam.scale.set(1 + Math.sin(k * Math.PI) * 1.2, 1, 1 + Math.sin(k * Math.PI) * 1.2);
          this.ultRing.position.set(0, 0.04, 4);
          this.ultRing.scale.setScalar(1 + k * 8.0);
          if (k >= 1) {
            this.ultT = -1;
            this.ultCharge = 0;
            this.beam.visible = this.ultRing.visible = false;
          }
        }
      }

      // Inertia drag rotation
      this.yaw += this.yawVel;
      this.yawVel *= 0.90;
      this.root.rotation.y = this.yaw;
    }

    dispose() {
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
            m.dispose();
          } catch(e) {}
        });
      }
    }
  }

  // --- High-Performance System Renderer ---
  class Apex01System {
    constructor() {
      this.canvas = null;
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.mech = null;
      this.active = false;
      this.animId = null;
      this.lastTime = performance.now();
    }

    init(canvasEl) {
      if (!canvasEl || typeof THREE === 'undefined') return false;
      this.canvas = canvasEl;
      this.THREE = THREE;

      try {
        const isLowEnd = (typeof navigator !== 'undefined') && (
          (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
          (window.innerWidth < 768) ||
          (navigator.deviceMemory && navigator.deviceMemory <= 3)
        );
        const pr = isLowEnd ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: !isLowEnd,
          alpha: true,
          powerPreference: isLowEnd ? 'low-power' : 'high-performance',
          precision: isLowEnd ? 'mediump' : 'highp'
        });
        this.renderer.setPixelRatio(pr);
        this.renderer.setSize(this.canvas.width, this.canvas.height, false);

        if (THREE.ACESFilmicToneMapping) {
          this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
          this.renderer.toneMappingExposure = 1.25;
        }
        if (THREE.SRGBColorSpace) {
          this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        }

        this.scene = new THREE.Scene();
        if (typeof window !== 'undefined' && window.createStudioEnvironment) {
          this.scene.environment = window.createStudioEnvironment(THREE, 'CS2');
        }
        this.camera = new THREE.PerspectiveCamera(36, this.canvas.width / this.canvas.height, 0.1, 80);
        this.camera.position.set(5.5, 3.8, 8.5);
        this.camera.lookAt(0, 2.5, 0);

        // Cyber Lighting
        this.scene.add(new THREE.HemisphereLight(0x7fb8ff, 0x070e1e, 0.6));
        const key = new THREE.DirectionalLight(0xffffff, 1.8);
        key.position.set(5, 8, 6);
        this.scene.add(key);

        const rimCyan = new THREE.PointLight(0x00e5ff, 12, 14);
        rimCyan.position.set(-4, 3, -3);
        this.scene.add(rimCyan);

        const rimPink = new THREE.PointLight(0xff007f, 10, 14);
        rimPink.position.set(4, 2, -4);
        this.scene.add(rimPink);

        const savedSkin = (typeof localStorage !== 'undefined' && localStorage.getItem('lg_mech_skin')) || 'OPTIMUS';
        this.setSkin(savedSkin);

        this.bindEvents();
        return true;
      } catch (e) {
        console.warn("WebGL initialization failed:", e);
        return false;
      }
    }

    setSkin(skinName) {
      if (this.currentSkin === skinName && this.mech) return;
      if (this.mech) {
        if (typeof this.mech.dispose === 'function') this.mech.dispose();
        if (this.scene) this.scene.remove(this.mech.root);
      }
      this.currentSkin = skinName;
      const T = this.THREE || (typeof THREE !== 'undefined' ? THREE : (typeof window !== 'undefined' ? window.THREE : null));
      if (!T) return;
      if (skinName === 'OPTIMUS' && window.OptimusPrimeMech) {
        this.mech = new window.OptimusPrimeMech(T);
      } else if (skinName === 'BUMBLEBEE' && window.BumblebeeMech) {
        this.mech = new window.BumblebeeMech(T);
      } else {
        this.mech = new Apex01Mech(T);
      }
      if (this.scene) this.scene.add(this.mech.root);
    }

    toggleTransform() {
      if (this.mech && typeof this.mech.toggleTransform === 'function') {
        return this.mech.toggleTransform();
      }
      return null;
    }

    fireWeapon() {
      if (this.mech && typeof this.mech.fireWeapon === 'function') {
        this.mech.fireWeapon();
      } else if (this.mech && typeof this.mech.shoot === 'function') {
        this.mech.shoot();
      }
    }

    swingAxe() {
      if (this.mech && typeof this.mech.swingAxe === 'function') {
        this.mech.swingAxe();
      } else if (this.mech && typeof this.mech.swingBlade === 'function') {
        this.mech.swingBlade();
      } else if (this.mech && typeof this.mech.hit === 'function') {
        this.mech.hit();
      }
    }

    toggleBattleMask(state) {
      if (this.mech && typeof this.mech.toggleBattleMask === 'function') {
        return this.mech.toggleBattleMask(state);
      }
      return false;
    }

    toggleMatrixChest(state) {
      if (this.mech && typeof this.mech.toggleMatrixChest === 'function') {
        return this.mech.toggleMatrixChest(state);
      }
      return false;
    }

    triggerDieselSmoke(burstCount) {
      if (this.mech && typeof this.mech.triggerDieselSmoke === 'function') {
        return this.mech.triggerDieselSmoke(burstCount);
      }
    }

    toggleHydraulicsCycle(state) {
      if (this.mech && typeof this.mech.toggleHydraulicsCycle === 'function') {
        return this.mech.toggleHydraulicsCycle(state);
      }
      return false;
    }

    toggleWheelSpin(state, speed) {
      if (this.mech && typeof this.mech.toggleWheelSpin === 'function') {
        return this.mech.toggleWheelSpin(state, speed);
      }
      return false;
    }

    setLookAtTarget(x, y) {
      if (this.mech && typeof this.mech.setLookAtTarget === 'function') {
        return this.mech.setLookAtTarget(x, y);
      }
    }

    bindEvents() {
      let down = null;
      this.canvas.addEventListener('pointerdown', (e) => {
        down = { x: e.clientX, lx: e.clientX, moved: false };
        try { this.canvas.setPointerCapture(e.pointerId); } catch(err) {}
      });

      this.canvas.addEventListener('pointermove', (e) => {
        if (!down) return;
        if (Math.abs(e.clientX - down.x) > 6) down.moved = true;
        if (down.moved && this.mech) {
          this.mech.yawVel = (e.clientX - down.lx) * 0.007;
        }
        down.lx = e.clientX;
      });

      this.canvas.addEventListener('pointerup', (e) => {
        if (down && !down.moved && this.mech) {
          if (typeof this.mech.hit === 'function') this.mech.hit();
          const name = (this.currentSkin === 'OPTIMUS') ? "OPTIMUS PRIME" : (this.currentSkin === 'BUMBLEBEE' ? "BUMBLEBEE" : "APEX-01");
          if (window.audio) {
            try {
              window.audio.heroSlash();
              window.audio.playSample('hero_dash', 0.8);
            } catch(err) {}
          }
          if (window.lastGridEngine) {
            window.lastGridEngine.vibrate([25, 20, 45]);
            window.lastGridEngine.addFloatingText(`⚡ ${name} ONLINE!`, 235, 280, "#00e5ff", 16);
          }
        }
        down = null;
      });

      this.canvas.addEventListener('pointercancel', () => { down = null; });
    }

    show() {
      if (!this.canvas) return;
      this.canvas.style.display = 'block';
      this.active = true;
      this.lastTime = performance.now();
      if (!this.animId) this.loop();
    }

    hide() {
      if (!this.canvas) return;
      this.canvas.style.display = 'none';
      this.active = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    dispose() {
      this.hide();
      if (this.mech && typeof this.mech.dispose === 'function') {
        this.mech.dispose();
        this.mech = null;
      }
      if (this.scene && this.scene.environment && typeof this.scene.environment.dispose === 'function') {
        this.scene.environment.dispose();
      }
      if (this.renderer) {
        try {
          this.renderer.dispose();
          const gl = this.renderer.getContext();
          if (gl && typeof gl.getExtension === 'function') {
            const loseContext = gl.getExtension('WEBGL_lose_context');
            if (loseContext) loseContext.loseContext();
          }
        } catch(e) {}
        this.renderer = null;
      }
      this.scene = null;
      this.camera = null;
    }

    loop() {
      if (!this.active) return;
      const now = performance.now();
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      if (this.mech) this.mech.update(dt);
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animId = requestAnimationFrame(() => this.loop());
    }
  }

  window.Apex01System = Apex01System;
  window.Apex01Mech = Apex01Mech;
})();

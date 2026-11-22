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
        const pr = Math.min(window.devicePixelRatio || 1, 3.0);
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          precision: 'highp',
          stencil: false,
          depth: true
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
        this.scene.background = new THREE.Color(0x050711);
        if (THREE.FogExp2) {
          this.scene.fog = new THREE.FogExp2(0x050711, 0.026);
        }
        if (this.renderer && THREE.PCFSoftShadowMap) {
          this.renderer.shadowMap.enabled = true;
          this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        if (typeof window !== 'undefined' && window.createStudioEnvironment) {
          this.scene.environment = window.createStudioEnvironment(THREE, 'NEON');
        }
        // Cinematic Imposing Character Camera: Zoomed in closer (Focal depth: 5.4m, FOV: 38 deg)
        this.camera = new THREE.PerspectiveCamera(38, this.canvas.width / this.canvas.height, 0.1, 80);
        this.camera.position.set(0, 0.22, 5.4);
        this.camera.lookAt(0, 0.12, 0);

        // Cinematic Decepticon Key + Rim + Dark Energon Lighting (Front Specular Focus)
        this.scene.add(new THREE.HemisphereLight(0x9333ea, 0x050814, 1.4));
        const key = new THREE.DirectionalLight(0xfff8ee, 4.2);
        key.position.set(2.0, 4.5, 4.5);
        key.castShadow = true;
        if (key.shadow) {
          key.shadow.mapSize.width = 1024;
          key.shadow.mapSize.height = 1024;
          key.shadow.bias = -0.001;
        }
        this.scene.add(key);

        const frontFill = new THREE.DirectionalLight(0xdbeafe, 2.2);
        frontFill.position.set(-2.0, 1.0, 4.0);
        this.scene.add(frontFill);

        // Atmospheric Sci-Fi Hangar Bay Illumination
        const bayFill = new THREE.PointLight(0x00e5ff, 8.0, 25.0);
        bayFill.position.set(0, 4.5, -6.0);
        this.scene.add(bayFill);

        const rimCyan = new THREE.PointLight(0x00e5ff, 18, 20);
        rimCyan.position.set(-4, 2.8, -2);
        this.scene.add(rimCyan);

        const rimViolet = new THREE.PointLight(0xa855f7, 24, 22);
        rimViolet.position.set(3.5, 3.5, -1.8);
        this.scene.add(rimViolet);
        this.rimViolet = rimViolet;

        const groundFill = new THREE.DirectionalLight(0x7e22ce, 2.2);
        groundFill.position.set(0, -3.5, 2.5);
        this.scene.add(groundFill);
        this.groundFill = groundFill;

        this.buildCyberHangarEnvironment(THREE);

        const savedSkin = 'MEGATRON';
        this.setSkin(savedSkin);

        this.bindEvents();
        return true;
      } catch (e) {
        console.warn("WebGL initialization failed:", e);
        return false;
      }
    }

    createGroundDeckTexture(THREE) {
      if (typeof document === 'undefined') return null;
      try {
        const can = document.createElement('canvas');
        can.width = 512;
        can.height = 512;
        const ctx = can.getContext('2d');
        if (!ctx || !ctx.fillRect) return null;

        // Heavy steel armor plating base
        ctx.fillStyle = '#0a0e18';
        ctx.fillRect(0, 0, 512, 512);

        // Modular floor tiles (4 x 4 = 16 panels of 128x128)
        for (let x = 0; x < 512; x += 128) {
          for (let y = 0; y < 512; y += 128) {
            const grad = ctx.createLinearGradient ? ctx.createLinearGradient(x, y, x + 128, y + 128) : null;
            if (grad && grad.addColorStop) {
              grad.addColorStop(0, '#161f30');
              grad.addColorStop(0.5, '#0e1422');
              grad.addColorStop(1, '#090d16');
              ctx.fillStyle = grad;
            } else {
              ctx.fillStyle = '#0e1422';
            }
            ctx.fillRect(x + 2, y + 2, 124, 124);

            ctx.strokeStyle = '#223048';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, 124, 124);

            // Fine diamond grip pattern
            ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
            for (let gx = x + 12; gx < x + 116; gx += 16) {
              for (let gy = y + 12; gy < y + 116; gy += 16) {
                ctx.fillRect(gx, gy, 4, 4);
              }
            }

            // Corner industrial rivets
            ctx.fillStyle = '#374768';
            [[x + 8, y + 8], [x + 120, y + 8], [x + 8, y + 120], [x + 120, y + 120]].forEach(([rx, ry]) => {
              ctx.beginPath();
              ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
              ctx.fill();
            });
          }
        }

        // Decepticon violet & amber glowing conduit seams
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 256); ctx.lineTo(512, 256);
        ctx.moveTo(256, 0); ctx.lineTo(256, 512);
        ctx.stroke();

        // Yellow & black hazard stripes strip along top & bottom edge
        const stripeH = 14;
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 512, stripeH);
        ctx.fillStyle = '#ca8a04';
        for (let s = -20; s < 532; s += 24) {
          ctx.beginPath();
          ctx.moveTo(s, 0);
          ctx.lineTo(s + 12, 0);
          ctx.lineTo(s + 2, stripeH);
          ctx.lineTo(s - 10, stripeH);
          ctx.fill();
        }

        const tex = new THREE.CanvasTexture(can);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(10, 10);
        return tex;
      } catch (e) {
        return null;
      }
    }

    createContactShadowTexture(THREE) {
      if (typeof document === 'undefined') return null;
      try {
        const can = document.createElement('canvas');
        can.width = 256;
        can.height = 256;
        const ctx = can.getContext('2d');
        if (!ctx || !ctx.fillRect) return null;

        const grad = ctx.createRadialGradient ? ctx.createRadialGradient(128, 128, 12, 128, 128, 124) : null;
        if (grad && grad.addColorStop) {
          grad.addColorStop(0.0, 'rgba(0, 0, 0, 0.96)');
          grad.addColorStop(0.30, 'rgba(0, 0, 0, 0.82)');
          grad.addColorStop(0.60, 'rgba(0, 0, 0, 0.45)');
          grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.12)');
          grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        }
        ctx.fillRect(0, 0, 256, 256);

        return new THREE.CanvasTexture(can);
      } catch (e) {
        return null;
      }
    }

    createCyberPanoramaTexture(THREE) {
      if (typeof document === 'undefined') return null;
      try {
        const can = document.createElement('canvas');
        can.width = 1024;
        can.height = 512;
        const ctx = can.getContext('2d');
        if (!ctx || !ctx.fillRect) return null;

        // 1. Deep Celestial Space Nebula Gradient
        const bgGrad = ctx.createLinearGradient ? ctx.createLinearGradient(0, 0, 0, 512) : null;
        if (bgGrad && bgGrad.addColorStop) {
          bgGrad.addColorStop(0.0, '#03050c');
          bgGrad.addColorStop(0.35, '#0b1126');
          bgGrad.addColorStop(0.65, '#1e0c38');
          bgGrad.addColorStop(0.88, '#120b22');
          bgGrad.addColorStop(1.0, '#050711');
          ctx.fillStyle = bgGrad;
        } else {
          ctx.fillStyle = '#050711';
        }
        ctx.fillRect(0, 0, 1024, 512);

        // 2. Cosmic Nebula Clouds (Cyan & Dark Energon Violet)
        if (ctx.createRadialGradient) {
          const neb1 = ctx.createRadialGradient(280, 140, 20, 280, 140, 260);
          neb1.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
          neb1.addColorStop(0.5, 'rgba(147, 51, 234, 0.12)');
          neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = neb1;
          ctx.fillRect(0, 0, 1024, 512);

          const neb2 = ctx.createRadialGradient(720, 180, 30, 720, 180, 290);
          neb2.addColorStop(0, 'rgba(0, 229, 255, 0.22)');
          neb2.addColorStop(0.5, 'rgba(30, 58, 138, 0.10)');
          neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = neb2;
          ctx.fillRect(0, 0, 1024, 512);
        }

        // 3. Dense Cybertronian Starfield (240 stars)
        for (let i = 0; i < 240; i++) {
          const sx = Math.sin(i * 997.3) * 512 + 512;
          const sy = Math.abs(Math.cos(i * 433.7)) * 360;
          const r = 0.5 + Math.abs(Math.sin(i * 123.1)) * 1.6;
          const alpha = 0.35 + Math.abs(Math.sin(i * 45.7)) * 0.65;
          const colType = i % 5;
          ctx.fillStyle = colType === 0 ? `rgba(192, 132, 252, ${alpha})` : (colType === 1 ? `rgba(56, 189, 248, ${alpha})` : `rgba(255, 255, 255, ${alpha})`);
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Shattered Cybertron Moon / Giant Planetary Ring Arc
        ctx.save();
        ctx.translate(560, 190);
        ctx.rotate(-0.24);

        if (ctx.createRadialGradient) {
          const moonGrad = ctx.createRadialGradient(-30, -30, 10, 0, 0, 100);
          moonGrad.addColorStop(0, '#475569');
          moonGrad.addColorStop(0.7, '#1e293b');
          moonGrad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');
          ctx.fillStyle = moonGrad;
        } else {
          ctx.fillStyle = '#1e293b';
        }
        ctx.beginPath();
        ctx.arc(0, 0, 95, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.85)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        if (ctx.ellipse) ctx.ellipse(0, 0, 240, 48, 0, 0, Math.PI * 2);
        else ctx.arc(0, 0, 180, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 214, 0, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (ctx.ellipse) ctx.ellipse(0, 0, 252, 52, 0, 0, Math.PI * 2);
        else ctx.arc(0, 0, 190, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 5. Far Distant Cybertron Metropolis Silhouette (Kaon Citadel & Spire Horizon)
        ctx.fillStyle = '#070b16';
        ctx.beginPath();
        ctx.moveTo(0, 512);
        ctx.lineTo(0, 390);

        const horizonPoints = [
          [0, 390], [60, 370], [110, 340], [130, 260], [140, 250], [150, 345],
          [210, 360], [270, 320], [300, 230], [315, 220], [330, 330],
          [400, 350], [450, 290], [480, 210], [500, 200], [520, 310],
          [580, 340], [640, 300], [680, 240], [700, 230], [720, 335],
          [790, 355], [840, 310], [870, 250], [890, 240], [910, 340],
          [970, 370], [1024, 385], [1024, 512]
        ];
        horizonPoints.forEach(([hx, hy], idx) => {
          if (idx === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        });
        ctx.closePath();
        ctx.fill();

        // Spire Glowing Neon Circuit Windows & Vertical Data Beams
        ctx.fillStyle = 'rgba(0, 229, 255, 0.65)';
        [140, 315, 500, 700, 890].forEach(bx => {
          for (let wy = 270; wy < 350; wy += 12) {
            ctx.fillRect(bx - 3, wy, 6, 4);
          }
        });
        ctx.fillStyle = 'rgba(192, 132, 252, 0.75)';
        [220, 420, 610, 810].forEach(bx => {
          for (let wy = 320; wy < 380; wy += 10) {
            ctx.fillRect(bx - 2, wy, 4, 3);
          }
        });

        // 6. Volumetric Atmospheric Fog Horizon Blending
        if (ctx.createLinearGradient) {
          const hazeGrad = ctx.createLinearGradient(0, 340, 0, 512);
          hazeGrad.addColorStop(0, 'rgba(5, 7, 17, 0)');
          hazeGrad.addColorStop(0.5, 'rgba(5, 7, 17, 0.7)');
          hazeGrad.addColorStop(1, 'rgba(5, 7, 17, 1.0)');
          ctx.fillStyle = hazeGrad;
          ctx.fillRect(0, 340, 1024, 172);
        }

        return new THREE.CanvasTexture(can);
      } catch (e) {
        return null;
      }
    }

    buildCyberHangarEnvironment(THREE) {
      if (!this.scene) return;
      this.hangarGroup = new THREE.Group();

      const matMetal = new THREE.MeshStandardMaterial({
        color: 0x141a29,
        metalness: 0.85,
        roughness: 0.35
      });
      const matDarkSteel = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.92,
        roughness: 0.28
      });
      const matEnergon = new THREE.MeshStandardMaterial({
        color: 0x4a044e,
        emissive: 0xa855f7,
        emissiveIntensity: 3.8,
        roughness: 0.2
      });
      const matFireMagma = new THREE.MeshStandardMaterial({
        color: 0x7c2d12,
        emissive: 0xff3d00,
        emissiveIntensity: 3.5,
        roughness: 0.25
      });
      const matRuinWall = new THREE.MeshStandardMaterial({
        color: 0x0a0f1d,
        metalness: 0.75,
        roughness: 0.55
      });

      // 1. Continuous Metallic Ground Deck (Plane spans across entire field at Y = -1.655)
      const floorTex = this.createGroundDeckTexture(THREE);
      const floorMat = new THREE.MeshStandardMaterial({
        map: floorTex || undefined,
        color: floorTex ? 0x90a0be : 0x0e1422,
        metalness: 0.85,
        roughness: 0.38
      });
      const floorGeo = new THREE.PlaneGeometry(80, 80);
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(0, -1.655, 0);
      floorMesh.receiveShadow = true;
      this.scene.add(floorMesh);

      // 2. Realistic 3D Cybertronian Command Dais / Recharging Pedestal
      // Elevated heavy-duty industrial platform (Rises 0.32 units from y = -1.655 to -1.335)
      const matDaisBase = new THREE.MeshStandardMaterial({
        color: 0x0c1322,
        metalness: 0.94,
        roughness: 0.28
      });
      const matDaisPlate = new THREE.MeshStandardMaterial({
        color: 0x162238,
        metalness: 0.90,
        roughness: 0.32
      });
      const matDaisDeck = new THREE.MeshStandardMaterial({
        color: 0x1e2c44,
        metalness: 0.85,
        roughness: 0.40
      });
      const matHazardStrip = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0x854d0e,
        emissiveIntensity: 0.8,
        roughness: 0.30
      });
      const matChromeHydraulic = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.98,
        roughness: 0.10
      });
      const matVentGlow = new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 3.2,
        roughness: 0.20
      });
      const matEnergonConduit = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0xa855f7,
        emissiveIntensity: 4.0,
        roughness: 0.18
      });

      // Tier 1: Heavy Beveled Octagonal Foundation Base (y: -1.655 to -1.535, h: 0.12, r: 2.6 -> 2.95)
      const baseGeo = new THREE.CylinderGeometry(2.6, 2.95, 0.12, 8);
      const baseMesh = new THREE.Mesh(baseGeo, matDaisBase);
      baseMesh.position.set(0, -1.595, 0);
      baseMesh.receiveShadow = true;
      this.hangarGroup.add(baseMesh);

      // Chamfered steel trim ring on Tier 1
      const baseTrimGeo = new THREE.TorusGeometry(2.78, 0.045, 8, 32);
      const baseTrim = new THREE.Mesh(baseTrimGeo, matDaisPlate);
      baseTrim.rotation.x = Math.PI / 2;
      baseTrim.position.set(0, -1.535, 0);
      this.hangarGroup.add(baseTrim);

      // Tier 2: Intermediate Armored Chassis (Octagonal, y: -1.535 to -1.415, h: 0.12, r: 2.2 -> 2.55)
      const midGeo = new THREE.CylinderGeometry(2.2, 2.55, 0.12, 8);
      const midMesh = new THREE.Mesh(midGeo, matDaisPlate);
      midMesh.position.set(0, -1.475, 0);
      midMesh.receiveShadow = true;
      this.hangarGroup.add(midMesh);

      // Hazard caution perimeter blocks on Tier 2 chamfers
      for (let h = 0; h < 8; h++) {
        const ang = h * (Math.PI / 4) + (Math.PI / 8);
        const hx = Math.cos(ang) * 2.36;
        const hz = Math.sin(ang) * 2.36;
        const hBlockGeo = new THREE.BoxGeometry(0.58, 0.08, 0.14);
        const hBlock = new THREE.Mesh(hBlockGeo, (h % 2 === 0) ? matHazardStrip : matDaisBase);
        hBlock.position.set(hx, -1.475, hz);
        hBlock.rotation.y = -ang + Math.PI / 2;
        this.hangarGroup.add(hBlock);
      }

      // Tier 3: Reinforced Titanium Standing Deck (y: -1.415 to -1.335, h: 0.08, r: 1.85 -> 2.10)
      const deckGeo = new THREE.CylinderGeometry(1.85, 2.10, 0.08, 12);
      const deckMesh = new THREE.Mesh(deckGeo, matDaisDeck);
      deckMesh.position.set(0, -1.375, 0);
      deckMesh.receiveShadow = true;
      this.hangarGroup.add(deckMesh);

      // Recessed Dark Energon & Cyber Conduits on top deck (Surface at y = -1.335)
      const conduitOuter = new THREE.TorusGeometry(1.72, 0.038, 8, 36);
      const conduitOuterMesh = new THREE.Mesh(conduitOuter, matEnergonConduit);
      conduitOuterMesh.rotation.x = Math.PI / 2;
      conduitOuterMesh.position.set(0, -1.332, 0);
      this.hangarGroup.add(conduitOuterMesh);

      const conduitInner = new THREE.TorusGeometry(1.08, 0.030, 8, 36);
      const conduitInnerMesh = new THREE.Mesh(conduitInner, matVentGlow);
      conduitInnerMesh.rotation.x = Math.PI / 2;
      conduitInnerMesh.position.set(0, -1.332, 0);
      this.hangarGroup.add(conduitInnerMesh);

      // 6 Heavy-Duty Hydraulic Piston Shock Struts (Angled at 45° from chassis into the floor)
      for (let p = 0; p < 6; p++) {
        const pAng = p * (Math.PI / 3);
        const px = Math.cos(pAng);
        const pz = Math.sin(pAng);

        const strutGroup = new THREE.Group();
        strutGroup.position.set(px * 2.18, -1.535, pz * 2.18);

        // Cylinder piston body
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.32, 10), matDaisBase);
        barrel.rotation.z = 0.52;
        barrel.rotation.y = -pAng;
        strutGroup.add(barrel);

        // Chrome rod
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.28, 8), matChromeHydraulic);
        rod.rotation.z = 0.52;
        rod.rotation.y = -pAng;
        rod.position.set(px * 0.08, -0.06, pz * 0.08);
        strutGroup.add(rod);

        // Floor anchor foot
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.24), matDaisBase);
        foot.position.set(px * 0.28, -0.11, pz * 0.28);
        strutGroup.add(foot);

        this.hangarGroup.add(strutGroup);
      }

      // 4 Perimeter Deck Uplights pointing upward at Megatron
      for (let u = 0; u < 4; u++) {
        const uAng = u * (Math.PI / 2) + (Math.PI / 4);
        const ux = Math.cos(uAng) * 1.78;
        const uz = Math.sin(uAng) * 1.78;
        const lightFixture = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.08, 10), matDaisBase);
        lightFixture.position.set(ux, -1.335, uz);
        this.hangarGroup.add(lightFixture);

        const lens = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), matVentGlow);
        lens.position.set(ux, -1.325, uz);
        this.hangarGroup.add(lens);
      }

      // 3. Realistic 3D Sci-Fi Military Hangar Environment (Sketchfab GLB Model)
      const loaderClass = (THREE && THREE.GLTFLoader) || (typeof window !== 'undefined' && window.GLTFLoader);
      if (loaderClass) {
        try {
          const loader = new loaderClass();
          loader.load('assets/models/hangar_bg.glb', (gltf) => {
            if (!gltf || !gltf.scene) return;
            const hangar = gltf.scene;
            // Dimensions: width: 1279.18, height: 798.87, depth: 2223.92, floor: y = 0.6267
            // Target width ~ 24.0 units gives scale = 0.01876
            const scale = 0.01876;
            hangar.scale.set(scale, scale, scale);
            // Perfectly align hangar interior floor with Megatron soles at y = -1.655
            hangar.position.set(0.0, -1.655 - (0.6267 * scale), -4.0);
            hangar.traverse((node) => {
              if (node.isMesh) {
                node.castShadow = false;
                node.receiveShadow = true;
                if (node.material) {
                  node.material.roughness = 0.45;
                  node.material.metalness = 0.82;
                  if (node.material.map && THREE.sRGBEncoding) {
                    node.material.map.encoding = THREE.sRGBEncoding;
                  }
                }
              }
            });
            this.hangarGlb = hangar;
            this.scene.add(hangar);
          }, undefined, (err) => {
            console.warn("Sketchfab hangar model loading fallback:", err);
          });
        } catch (e) {
          console.warn("GLTFLoader exception:", e);
        }
      }

      // 4. 96 Floating 3D Dark Energon & Fiery Ember Particles
      const pCount = 96;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = (Math.random() - 0.5) * 5.5;
        pPos[i * 3 + 1] = -1.6 + Math.random() * 5.8;
        pPos[i * 3 + 2] = -3.5 + Math.random() * 5.0;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xc084fc,
        size: 0.09,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      this.hangarParticles = new THREE.Points(pGeo, pMat);
      this.hangarGroup.add(this.hangarParticles);

      // Flickering Fiery & Dark Energon Point Lights
      this.pedestalLight = new THREE.PointLight(0xa855f7, 8.5, 7.0);
      this.pedestalLight.position.set(0, -1.4, 0.6);
      this.hangarGroup.add(this.pedestalLight);

      this.fireLight = new THREE.PointLight(0xff3d00, 6.0, 8.0);
      this.fireLight.position.set(1.8, -1.2, 1.0);
      this.hangarGroup.add(this.fireLight);

      // Center Command Dais & Energon Lighting directly under Megatron (x: -1.95)
      this.hangarGroup.position.set(-1.95, 0, 0);

      this.scene.add(this.hangarGroup);
    }

    resize(cssW, cssH) {
      if (!this.canvas || !this.renderer || !this.camera) return;
      const pr = Math.min(window.devicePixelRatio || 1, 3.0);
      this.renderer.setPixelRatio(pr);
      this.renderer.setSize(cssW, cssH, false);
      this.camera.aspect = cssW / cssH;
      this.camera.updateProjectionMatrix();
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
      if (skinName === 'MEGATRON' && window.MegatronMech) {
        this.mech = new window.MegatronMech(T);
      } else if (skinName === 'OPTIMUS' && window.OptimusPrimeMech) {
        this.mech = new window.OptimusPrimeMech(T);
      } else if (skinName === 'BUMBLEBEE' && window.BumblebeeMech) {
        this.mech = new window.BumblebeeMech(T);
      } else {
        this.mech = new Apex01Mech(T);
      }
      if (this.mech && this.mech.root) {
        this.mech.root.position.set(-1.95, 0.24, 0);
        this.attachGroundContactShadows(T);
      }
      if (this.scene) this.scene.add(this.mech.root);

      // Dynamically adapt studio rim and fill lighting to character faction
      if (this.rimViolet && this.groundFill && T.Color) {
        if (skinName === 'OPTIMUS') {
          this.rimViolet.color.setHex(0xff1744); // Crimson Autobot Rim
          this.groundFill.color.setHex(0x1d4ed8); // Cybertron Blue
        } else if (skinName === 'BUMBLEBEE') {
          this.rimViolet.color.setHex(0xffd600); // Stinger Gold Rim
          this.groundFill.color.setHex(0xca8a04); // Warm Amber Fill
        } else {
          this.rimViolet.color.setHex(0xa855f7); // Dark Energon Violet Rim
          this.groundFill.color.setHex(0x7e22ce); // Decepticon Purple
        }
      }
    }

    attachGroundContactShadows(T) {
      if (!this.mech || !this.mech.root || !T || !T.PlaneGeometry || !T.MeshBasicMaterial || !T.Mesh) return;
      if (!this.contactShadowTex) {
        this.contactShadowTex = this.createContactShadowTexture(T);
      }
      if (!this.contactShadowTex) return;

      const shadowMat = new T.MeshBasicMaterial({
        map: this.contactShadowTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      });

      // 1. Overall Body AO Ground Contact Shadow Decal
      const bodyShadow = new T.Mesh(new T.PlaneGeometry(3.6, 2.8), shadowMat);
      bodyShadow.rotation.x = -Math.PI / 2;
      bodyShadow.position.set(0, -1.572, 0);
      this.mech.root.add(bodyShadow);

      // 2. High-contrast Left Boot Contact Shadow Decal
      const bootMatL = new T.MeshBasicMaterial({
        map: this.contactShadowTex,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      const bootL = new T.Mesh(new T.PlaneGeometry(0.85, 1.4), bootMatL);
      bootL.rotation.x = -Math.PI / 2;
      bootL.position.set(-0.42, -1.570, 0.08);
      this.mech.root.add(bootL);

      // 3. High-contrast Right Boot Contact Shadow Decal
      const bootMatR = new T.MeshBasicMaterial({
        map: this.contactShadowTex,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      const bootR = new T.Mesh(new T.PlaneGeometry(0.85, 1.4), bootMatR);
      bootR.rotation.x = -Math.PI / 2;
      bootR.position.set(0.42, -1.570, -0.06);
      this.mech.root.add(bootR);
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
      this.pointerActive = false;

      this.canvas.addEventListener('pointerenter', () => { this.pointerActive = true; });
      this.canvas.addEventListener('pointerleave', () => {
        this.pointerActive = false;
        if (this.mech && typeof this.mech.setLookAtTarget === 'function') {
          this.mech.setLookAtTarget(0, 0);
        }
      });

      this.canvas.addEventListener('pointerdown', (e) => {
        this.pointerActive = true;
        down = { x: e.clientX, lx: e.clientX, moved: false };
        try { this.canvas.setPointerCapture(e.pointerId); } catch(err) {}
      });

      this.canvas.addEventListener('pointermove', (e) => {
        // Look-At Head Tracking
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          if (this.mech && typeof this.mech.setLookAtTarget === 'function') {
            this.mech.setLookAtTarget(nx, ny);
          }
        }

        if (!down) return;
        if (Math.abs(e.clientX - down.x) > 6) down.moved = true;
        if (down.moved && this.mech) {
          this.mech.yawVel = (e.clientX - down.lx) * 0.007;
        }
        down.lx = e.clientX;
      });

      this.canvas.addEventListener('pointerup', (e) => {
        this.pointerActive = false;
        if (down && !down.moved && this.mech) {
          if (typeof this.mech.hit === 'function') this.mech.hit();
          const name = (this.currentSkin === 'MEGATRON') ? "MEGATRON (DECEPTICON LEADER)" : ((this.currentSkin === 'OPTIMUS') ? "OPTIMUS PRIME" : (this.currentSkin === 'BUMBLEBEE' ? "BUMBLEBEE" : "APEX-01"));
          const col = (this.currentSkin === 'MEGATRON') ? "#c084fc" : "#00e5ff";
          if (window.audio) {
            try {
              window.audio.heroSlash();
              window.audio.playSample('hero_dash', 0.8);
            } catch(err) {}
          }
          if (window.lastGridEngine) {
            window.lastGridEngine.vibrate([25, 20, 45]);
            window.lastGridEngine.addFloatingText(`⚡ ${name} ONLINE!`, 268, 280, col, 16);
          }
        }
        down = null;
      });

      this.canvas.addEventListener('pointercancel', () => { down = null; this.pointerActive = false; });
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

      if (this.mech) {
        // Slow idle turntable rotation when hands are off
        if (!this.pointerActive && Math.abs(this.mech.yawVel) < 0.002) {
          this.mech.yaw += dt * 0.32;
        }
        this.mech.update(dt);
      }
      if (this.hangarParticles && this.hangarParticles.geometry) {
        const pos = this.hangarParticles.geometry.attributes.position;
        if (pos) {
          for (let i = 0; i < pos.count; i++) {
            let y = pos.getY(i) + dt * 0.45;
            if (y > 4.2) y = -1.6;
            pos.setY(i, y);
          }
          pos.needsUpdate = true;
        }
      }
      if (this.pedestalLight) {
        this.pedestalLight.intensity = 7.0 + Math.sin(now * 0.003) * 2.5;
      }
      if (this.fireLight) {
        this.fireLight.intensity = 5.0 + Math.sin(now * 0.007) * 2.2 + Math.cos(now * 0.013) * 1.2;
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animId = requestAnimationFrame(() => this.loop());
    }
  }

  window.Apex01System = Apex01System;
  window.Apex01Mech = Apex01Mech;
})();

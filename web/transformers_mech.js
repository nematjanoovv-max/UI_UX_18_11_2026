// =============================================================================
// TRANSFORMERS 3D MECH ENGINE (Optimus Prime & Bumblebee)
// Procedural Three.js Photorealistic PBR Rigged Models & Transformations
// Designed for Tower Defense: Last Grid
// =============================================================================

(function() {
  'use strict';

  const rootScope = (typeof window !== 'undefined') ? window : ((typeof global !== 'undefined') ? global : this);

  function createTransformerTextures(THREE) {
    let _seed = 8765432;
    const rnd = () => {
      _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0;
      let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    // Optimus Prime Peterbilt Crimson with Flame Decals
    function primeCrimsonCanvas(size = 512) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      g.fillStyle = '#b91c1c'; g.fillRect(0, 0, size, size); // Deep Peterbilt Red

      // Micro grit and metallic speckles
      const img = g.getImageData(0, 0, size, size), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (rnd() - 0.5) * 16;
        d[i] = Math.min(255, Math.max(0, d[i] + n));
        d[i+1] = Math.min(255, Math.max(0, d[i+1] + n));
        d[i+2] = Math.min(255, Math.max(0, d[i+2] + n));
      }
      g.putImageData(img, 0, 0);

      // Cyan-edged flame tribals
      g.fillStyle = '#1e3a8a';
      g.beginPath();
      g.moveTo(0, size); g.lineTo(size * 0.4, size); g.lineTo(size * 0.2, size * 0.5);
      g.lineTo(size * 0.5, size * 0.6); g.lineTo(0, size * 0.2);
      g.closePath(); g.fill();
      g.strokeStyle = '#00e5ff'; g.lineWidth = 3; g.stroke();

      // Silver metal chipped edges & rivets
      g.strokeStyle = 'rgba(226, 232, 240, 0.4)'; g.lineWidth = 1.5;
      for (let i = 0; i < 16; i++) {
        const x = rnd() * size, y = rnd() * size, w = 40 + rnd() * 80, h = 30 + rnd() * 60;
        g.strokeRect(x, y, w, h);
      }
      return c;
    }

    // Optimus Prime Cobalt Blue
    function primeCobaltCanvas(size = 256) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      g.fillStyle = '#1d4ed8'; g.fillRect(0, 0, size, size);
      const img = g.getImageData(0, 0, size, size), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (rnd() - 0.5) * 14;
        d[i] = Math.min(255, Math.max(0, d[i] + n));
        d[i+1] = Math.min(255, Math.max(0, d[i+1] + n));
        d[i+2] = Math.min(255, Math.max(0, d[i+2] + n));
      }
      g.putImageData(img, 0, 0);
      g.strokeStyle = 'rgba(255, 255, 255, 0.15)'; g.lineWidth = 1.2;
      g.strokeRect(10, 10, size - 20, size - 20);
      return c;
    }

    // Bumblebee Canary Yellow with Dual Black Racing Stripes
    function beeYellowCanvas(size = 512) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      g.fillStyle = '#facc15'; g.fillRect(0, 0, size, size); // Vibrant Camaro Yellow

      // Dual matte black racing stripes
      g.fillStyle = '#0f172a';
      g.fillRect(size * 0.28, 0, size * 0.18, size);
      g.fillRect(size * 0.54, 0, size * 0.18, size);

      // Fine pinstripes
      g.strokeStyle = '#e2e8f0'; g.lineWidth = 2;
      g.strokeRect(size * 0.28, 0, size * 0.18, size);
      g.strokeRect(size * 0.54, 0, size * 0.18, size);

      // Metallic clearcoat flakes
      const img = g.getImageData(0, 0, size, size), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (rnd() - 0.5) * 12;
        d[i] += n; d[i+1] += n; d[i+2] += n;
      }
      g.putImageData(img, 0, 0);
      return c;
    }

    // Mirror Chrome Truck Radiator Grille
    function chromeGrilleCanvas(size = 256) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      g.fillStyle = '#cbd5e1'; g.fillRect(0, 0, size, size);
      g.fillStyle = '#090d16';
      for (let x = 12; x < size - 12; x += 16) {
        g.fillRect(x, 8, 6, size - 16);
      }
      g.strokeStyle = '#ffffff'; g.lineWidth = 4;
      g.strokeRect(4, 4, size - 8, size - 8);
      return c;
    }

    // Normal Map for metal plates
    function normalMapCanvas(size = 256) {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d');
      const img = g.createImageData(size, size), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 128 + Math.floor((rnd() - 0.5) * 25);
        d[i+1] = 128 + Math.floor((rnd() - 0.5) * 25);
        d[i+2] = 255;
        d[i+3] = 255;
      }
      g.putImageData(img, 0, 0);
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
      tNormal: makeTex(normalMapCanvas(), 2, 2)
    };
  }

  // ===========================================================================
  // 1. OPTIMUS PRIME 3D RIG (Autobot Leader)
  // ===========================================================================
  class OptimusPrimeMech {
    constructor(THREE) {
      this.THREE = THREE;
      const tex = createTransformerTextures(THREE);
      const std = o => new THREE.MeshStandardMaterial(o);

      this.M = {
        crimson: std({ map: tex.tPrimeCrimson, normalMap: tex.tNormal, metalness: 0.85, roughness: 0.32 }),
        cobalt: std({ map: tex.tPrimeCobalt, normalMap: tex.tNormal, metalness: 0.82, roughness: 0.35 }),
        grille: std({ map: tex.tChromeGrille, metalness: 0.95, roughness: 0.18 }),
        chrome: std({ color: 0xf1f5f9, metalness: 1.0, roughness: 0.12 }),
        steel: std({ color: 0x334155, metalness: 0.88, roughness: 0.35 }),
        darkChassis: std({ color: 0x0f172a, metalness: 0.75, roughness: 0.55 }),
        tireRubber: std({ color: 0x090d16, metalness: 0.15, roughness: 0.85 }),
        truckGlass: std({ color: 0x0284c7, emissive: 0x00e5ff, emissiveIntensity: 0.45, metalness: 0.9, roughness: 0.05, transparent: true, opacity: 0.65 }),
        opticsBlue: std({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 2.8, metalness: 0.2, roughness: 0.3 }),
        matrixGold: std({ color: 0xfbbf24, emissive: 0xffd600, emissiveIntensity: 2.4, metalness: 0.5, roughness: 0.2 }),
        energonAxe: std({ color: 0xf97316, emissive: 0xff5722, emissiveIntensity: 2.5, transparent: true, opacity: 0.85, metalness: 0.2, roughness: 0.1 }),
        ionBlaster: std({ color: 0x1e293b, metalness: 0.92, roughness: 0.28 })
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
      const tor = (r, t, seg = 20) => new T.TorusGeometry(r, t, 8, seg);
      const sph = r => new T.SphereGeometry(r, 16, 12);

      // --- Platform ---
      this.platform = new T.Group();
      this.root.add(this.platform);
      this.put(this.platform, cy(3.8, 4.0, 0.35, 8), M.darkChassis, 0, -2.1, 0);
      this.put(this.platform, tor(3.5, 0.06, 48), M.opticsBlue, 0, -1.9, 0, Math.PI / 2, 0, 0);

      // --- Pelvis & Hips ---
      this.pelvis = new T.Group();
      this.body.add(this.pelvis);
      this.put(this.pelvis, box(1.8, 0.65, 1.2), M.darkChassis, 0, 0.1, 0);
      this.put(this.pelvis, box(1.1, 0.45, 0.35), M.steel, 0, 0.1, 0.55); // Front belt buckle plate
      this.put(this.pelvis, box(0.5, 0.15, 0.1), M.matrixGold, 0, 0.1, 0.74);

      // Side fuel tanks
      [-1.1, 1.1].forEach(s => {
        this.put(this.pelvis, cy(0.32, 0.32, 1.2, 12), M.chrome, s, 0.1, 0, Math.PI / 2, 0, 0);
        this.put(this.pelvis, tor(0.32, 0.03, 16), M.steel, s, 0.1, 0.4, 0, 0, 0);
        this.put(this.pelvis, tor(0.32, 0.03, 16), M.steel, s, 0.1, -0.4, 0, 0, 0);
      });

      // --- Torso & Peterbilt Truck Cab ---
      this.torso = new T.Group();
      this.torso.position.set(0, 0.4, 0);
      this.body.add(this.torso);

      // Red Cab Body
      this.put(this.torso, box(2.4, 1.8, 1.6), M.crimson, 0, 1.0, 0);

      // Chest Dual Windshield Windows
      [-0.55, 0.55].forEach(s => {
        this.put(this.torso, box(0.85, 0.75, 0.12), M.truckGlass, s, 1.2, 0.84);
        this.put(this.torso, box(0.9, 0.8, 0.06), M.steel, s, 1.2, 0.82);
      });

      // Matrix of Leadership inside chest
      this.matrixCore = this.put(this.torso, sph(0.24), M.matrixGold, 0, 1.2, 0.4);

      // Front Chrome Radiator Grille
      this.grille = this.put(this.torso, box(1.2, 0.85, 0.15), M.grille, 0, 0.45, 0.86);

      // Roof Cab Amber Clearance Marker Lights
      for (let i = -2; i <= 2; i++) {
        this.put(this.torso, box(0.12, 0.08, 0.14), M.matrixGold, i * 0.42, 1.95, 0.75);
      }

      // Dual Chrome Exhaust Smokestacks (Iconic Prime Pipes)
      this.stacks = [];
      [-1.25, 1.25].forEach(s => {
        const stack = new T.Group();
        stack.position.set(s, 1.0, -0.7);
        this.torso.add(stack);
        this.put(stack, cy(0.12, 0.12, 2.6, 12), M.chrome, 0, 0.8, 0);
        this.put(stack, cy(0.14, 0.14, 0.35, 12), M.steel, 0, 0, 0);
        // Beveled stack pipe tip
        this.put(stack, cy(0.12, 0.12, 0.4, 12), M.chrome, 0, 2.2, 0.08, -0.4, 0, 0);
        this.stacks.push(stack);
      });

      // --- Optimus Prime Helmet & Head ---
      this.head = new T.Group();
      this.head.position.set(0, 2.05, 0.2);
      this.torso.add(this.head);

      // Blue Helmet Dome & Forehead Crest
      this.put(this.head, box(0.75, 0.65, 0.75), M.cobalt, 0, 0.25, 0);
      this.put(this.head, box(0.14, 0.35, 0.65), M.cobalt, 0, 0.65, 0.05); // Central fin

      // Side Antenna Audio Receptors (Ears)
      [-0.42, 0.42].forEach(s => {
        this.put(this.head, cy(0.05, 0.05, 0.65, 8), M.cobalt, s, 0.45, 0);
        this.put(this.head, cy(0.08, 0.08, 0.2, 8), M.chrome, s, 0.25, 0, 0, 0, Math.PI / 2);
      });

      // Glowing Blue Optics & Battle Mask
      this.put(this.head, box(0.48, 0.1, 0.08), M.opticsBlue, 0, 0.32, 0.39);
      this.put(this.head, box(0.55, 0.28, 0.16), M.chrome, 0, 0.12, 0.38); // Silver mouthplate

      // --- Shoulders & Arms ---
      // Right Arm with Ion Blaster
      this.armR = new T.Group();
      this.armR.position.set(1.5, 1.6, 0);
      this.torso.add(this.armR);

      this.put(this.armR, box(0.9, 0.85, 0.9), M.crimson, 0, 0, 0); // Shoulder block
      this.put(this.armR, cy(0.24, 0.24, 0.7, 8), M.steel, 0, -0.65, 0);
      this.put(this.armR, box(0.7, 1.2, 0.7), M.cobalt, 0, -1.3, 0.1); // Forearm
      this.put(this.armR, cy(0.06, 0.06, 0.8, 8), M.chrome, 0.32, -1.1, -0.2); // Piston

      // Ion Blaster Rifle
      this.ionBlaster = new T.Group();
      this.ionBlaster.position.set(0, -1.7, 0.4);
      this.armR.add(this.ionBlaster);
      this.put(this.ionBlaster, box(0.35, 0.45, 2.4), M.ionBlaster, 0, 0, 0.6);
      this.put(this.ionBlaster, cy(0.14, 0.14, 1.6, 12), M.steel, 0, 0, 2.0, Math.PI / 2, 0, 0);
      this.put(this.ionBlaster, tor(0.18, 0.04, 12), M.opticsBlue, 0, 0, 2.7);

      // Left Arm with Energon Axe
      this.armL = new T.Group();
      this.armL.position.set(-1.5, 1.6, 0);
      this.torso.add(this.armL);

      this.put(this.armL, box(0.9, 0.85, 0.9), M.crimson, 0, 0, 0);
      this.put(this.armL, cy(0.24, 0.24, 0.7, 8), M.steel, 0, -0.65, 0);
      this.put(this.armL, box(0.7, 1.2, 0.7), M.cobalt, 0, -1.3, 0.1);

      // Energon Battle Axe (Deployable)
      this.energonAxe = new T.Group();
      this.energonAxe.position.set(0, -1.8, 0.4);
      this.armL.add(this.energonAxe);
      this.put(this.energonAxe, box(0.12, 1.4, 0.12), M.steel, 0, 0, 0);
      this.put(this.energonAxe, box(0.1, 1.8, 0.9), M.energonAxe, 0, 0.2, 0.5, 0.3, 0, 0);

      // --- Legs & Truck Wheels ---
      const makeLeg = (side) => {
        const hip = new T.Group();
        hip.position.set(side * 0.68, 0, 0);
        this.body.add(hip);

        // Blue Thigh & Chrome Hydraulics
        this.put(hip, box(0.68, 1.2, 0.72), M.cobalt, 0, -0.6, 0);
        this.put(hip, cy(0.08, 0.08, 0.9, 8), M.chrome, side * 0.25, -0.6, -0.32);

        // Knee Cap & Shins
        const shin = new T.Group();
        shin.position.set(0, -1.2, 0);
        hip.add(shin);

        this.put(shin, box(0.55, 0.45, 0.3), M.steel, 0, 0.1, 0.42); // Knee cap
        this.put(shin, box(0.85, 1.6, 0.95), M.cobalt, 0, -0.7, 0);

        // Truck Wheels on Outer Shins (Dual Rear Tires)
        [-0.4, 0.4].forEach(z => {
          const wheel = this.put(shin, cy(0.42, 0.42, 0.32, 16), M.tireRubber, side * 0.58, -0.7, z, 0, 0, Math.PI / 2);
          this.put(wheel, cy(0.24, 0.24, 0.34, 12), M.chrome, 0, 0, 0);
        });

        // Articulated Boot
        this.put(shin, box(0.9, 0.45, 1.3), M.cobalt, 0, -1.6, 0.2);
        this.put(shin, box(0.85, 0.2, 0.4), M.steel, 0, -1.5, 0.8);

        return { hip, shin };
      };

      this.legR = makeLeg(1);
      this.legL = makeLeg(-1);
    }

    update(dt) {
      this.time += dt;

      // Idle breathing & engine rumble
      const breath = Math.sin(this.time * 2.8) * 0.03;
      if (this.torso) this.torso.position.y = 0.4 + breath;

      // Matrix core pulsation
      if (this.matrixCore) {
        const p = 1.0 + Math.sin(this.time * 4.0) * 0.15;
        this.matrixCore.scale.set(p, p, p);
      }

      // Smokestack subtle heat shimmer
      if (this.stacks) {
        for (let i = 0; i < this.stacks.length; i++) {
          this.stacks[i].rotation.z = Math.sin(this.time * 3 + i) * 0.02;
        }
      }

      // Smooth Recoil Recovery
      if (this.recoil > 0) {
        this.recoil = Math.max(0, this.recoil - dt * 4.0);
        if (this.ionBlaster) this.ionBlaster.position.z = 0.4 - this.recoil * 0.4;
      }

      // Energon Axe Battle Glow Pulse & Swing
      if (this.energonAxe) {
        const glow = 1.0 + Math.sin(this.time * 6.0) * 0.25;
        this.energonAxe.scale.set(1, glow, glow);
      }
      if (this.axeSwing > 0) {
        this.axeSwing = Math.max(0, this.axeSwing - dt * 3.5);
        if (this.armR) this.armR.rotation.x = Math.sin(this.axeSwing * Math.PI) * 1.8;
      }

      // Animation mixer update (Sketchfab animated models)
      if (this.mixer) this.mixer.update(dt);

      // Inertia drag rotation
      this.yaw += this.yawVel;
      this.yawVel *= 0.90;
      this.root.rotation.y = this.yaw;

      // Transformation Morph Animation
      const targetTrans = (this.mode === 'VEHICLE') ? 1.0 : 0.0;
      if (Math.abs(this.transProgress - targetTrans) > 0.01) {
        this.transProgress += (targetTrans - this.transProgress) * Math.min(1.0, dt * 5.0);
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
              child.material.roughness = Math.min(child.material.roughness || 0.5, 0.45);
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
      if (this.head) this.head.position.y = 2.05 - p * 0.9; // Head tucks into cab
      if (this.head) this.head.scale.set(1 - p * 0.8, 1 - p * 0.8, 1 - p * 0.8);

      if (this.armR) {
        this.armR.position.x = 1.5 - p * 0.4;
        this.armR.rotation.x = p * 1.57; // Arms fold back as cab sides
      }
      if (this.armL) {
        this.armL.position.x = -1.5 + p * 0.4;
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
            m.dispose();
          } catch(e) {}
        });
      }
    }
  }

  // ===========================================================================
  // 2. BUMBLEBEE 3D RIG (Autobot Scout)
  // ===========================================================================
  class BumblebeeMech {
    constructor(THREE) {
      this.THREE = THREE;
      const tex = createTransformerTextures(THREE);
      const std = o => new THREE.MeshStandardMaterial(o);

      this.M = {
        yellow: std({ map: tex.tBeeYellow, normalMap: tex.tNormal, metalness: 0.88, roughness: 0.28 }),
        darkAlloy: std({ color: 0x111827, metalness: 0.85, roughness: 0.45 }),
        grilleMesh: std({ map: tex.tChromeGrille, metalness: 0.9, roughness: 0.25 }),
        chrome: std({ color: 0xf1f5f9, metalness: 1.0, roughness: 0.12 }),
        tireRubber: std({ color: 0x090d16, metalness: 0.2, roughness: 0.8 }),
        headlightLED: std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.8, metalness: 0.1, roughness: 0.2 }),
        opticsBlue: std({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 3.0, metalness: 0.2, roughness: 0.2 }),
        stingerPlasma: std({ color: 0xfacc15, emissive: 0xffd600, emissiveIntensity: 2.6, metalness: 0.3, roughness: 0.2 }),
        plasmaBarrel: std({ color: 0x1e293b, metalness: 0.95, roughness: 0.22 })
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
      const tor = (r, t, seg = 20) => new T.TorusGeometry(r, t, 8, seg);
      const sph = r => new T.SphereGeometry(r, 16, 12);

      // --- Platform ---
      this.platform = new T.Group();
      this.root.add(this.platform);
      this.put(this.platform, cy(3.6, 3.8, 0.35, 8), M.darkAlloy, 0, -2.1, 0);
      this.put(this.platform, tor(3.3, 0.06, 48), M.stingerPlasma, 0, -1.9, 0, Math.PI / 2, 0, 0);

      // --- Pelvis ---
      this.pelvis = new T.Group();
      this.body.add(this.pelvis);
      this.put(this.pelvis, box(1.5, 0.55, 1.1), M.darkAlloy, 0, 0, 0);
      this.put(this.pelvis, box(0.9, 0.4, 0.25), M.yellow, 0, 0, 0.55);

      // --- Torso & Cyber-Camaro Front Hood ---
      this.torso = new T.Group();
      this.torso.position.set(0, 0.35, 0);
      this.body.add(this.torso);

      // Sloped Sports Car Hood on Chest
      this.put(this.torso, box(2.1, 1.4, 1.5), M.darkAlloy, 0, 0.8, 0);
      this.put(this.torso, box(1.9, 1.2, 0.4), M.yellow, 0, 0.9, 0.75, -0.22, 0, 0); // Hood plate with stripes

      // Radiator Grille & Twin Round Headlights
      this.put(this.torso, box(1.3, 0.35, 0.15), M.grilleMesh, 0, 0.45, 0.92);
      [-0.75, 0.75].forEach(s => {
        this.put(this.torso, cy(0.14, 0.14, 0.12, 16), M.headlightLED, s, 0.5, 0.94, Math.PI / 2, 0, 0);
        this.put(this.torso, tor(0.14, 0.03, 16), M.chrome, s, 0.5, 0.95);
      });

      // Front bumper chin splitter
      this.put(this.torso, box(1.8, 0.12, 0.4), M.darkAlloy, 0, 0.25, 0.95);

      // Deployable Door Wings behind shoulders (Iconic Bumblebee Wings)
      this.wings = [];
      [-1.1, 1.1].forEach(s => {
        const wing = new T.Group();
        wing.position.set(s, 1.4, -0.7);
        this.torso.add(wing);
        this.put(wing, box(0.9, 1.4, 0.12), M.yellow, s * 0.4, 0.2, 0, 0, -s * 0.35, s * 0.25);
        this.put(wing, box(0.7, 0.5, 0.08), M.darkAlloy, s * 0.4, 0.2, 0.05);
        this.wings.push(wing);
      });

      // --- Bumblebee Head & Horns ---
      this.head = new T.Group();
      this.head.position.set(0, 1.75, 0.2);
      this.torso.add(this.head);

      // Rounded Yellow Helmet
      this.put(this.head, sph(0.42), M.yellow, 0, 0.25, 0);
      this.put(this.head, box(0.16, 0.12, 0.45), M.darkAlloy, 0, 0.55, 0); // Forehead stripe

      // Horn Antennae
      [-0.32, 0.32].forEach(s => {
        this.put(this.head, cy(0.04, 0.08, 0.4, 8), M.yellow, s, 0.5, -0.05, 0, 0, -s * 0.3);
      });

      // Expressive Circular Blue Optics & Stinger Mask
      [-0.15, 0.15].forEach(s => {
        this.put(this.head, cy(0.08, 0.08, 0.08, 12), M.opticsBlue, s, 0.28, 0.38, Math.PI / 2, 0, 0);
        this.put(this.head, tor(0.08, 0.02, 12), M.darkAlloy, s, 0.28, 0.42);
      });
      this.put(this.head, box(0.35, 0.2, 0.15), M.darkAlloy, 0, 0.1, 0.38);

      // --- Shoulders & Arms ---
      // Right Arm: Stinger Plasma Cannon
      this.armR = new T.Group();
      this.armR.position.set(1.35, 1.35, 0);
      this.torso.add(this.armR);

      this.put(this.armR, box(0.75, 0.7, 0.75), M.yellow, 0, 0, 0);
      this.put(this.armR, cy(0.18, 0.18, 0.6, 8), M.darkAlloy, 0, -0.5, 0);

      // Retractable Plasma Cannon Arm
      this.cannon = new T.Group();
      this.cannon.position.set(0, -1.0, 0.1);
      this.armR.add(this.cannon);
      this.put(this.cannon, box(0.65, 0.9, 0.65), M.darkAlloy, 0, 0, 0);
      this.put(this.cannon, cy(0.24, 0.18, 1.4, 16), M.plasmaBarrel, 0, 0, 0.6, Math.PI / 2, 0, 0);
      this.put(this.cannon, tor(0.26, 0.05, 16), M.stingerPlasma, 0, 0, 1.1);
      this.put(this.cannon, sph(0.12), M.stingerPlasma, 0, 0, 1.35); // Plasma charge node

      // Left Arm: Articulated Hand & Cyber-Blade
      this.armL = new T.Group();
      this.armL.position.set(-1.35, 1.35, 0);
      this.torso.add(this.armL);

      this.put(this.armL, box(0.75, 0.7, 0.75), M.yellow, 0, 0, 0);
      this.put(this.armL, cy(0.18, 0.18, 0.6, 8), M.darkAlloy, 0, -0.5, 0);
      this.put(this.armL, box(0.55, 1.0, 0.55), M.yellow, 0, -1.0, 0.05);
      this.put(this.armL, box(0.1, 1.1, 0.35), M.chrome, 0, -1.4, 0.4, 0.25, 0, 0); // Stinger blade

      // --- Agile Legs & Alloy Car Wheels ---
      const makeBeeLeg = (side) => {
        const hip = new T.Group();
        hip.position.set(side * 0.58, 0, 0);
        this.body.add(hip);

        this.put(hip, box(0.55, 1.1, 0.6), M.yellow, 0, -0.55, 0);
        this.put(hip, cy(0.07, 0.07, 0.8, 8), M.chrome, side * 0.2, -0.55, -0.25);

        const shin = new T.Group();
        shin.position.set(0, -1.1, 0);
        hip.add(shin);

        this.put(shin, box(0.68, 1.4, 0.75), M.darkAlloy, 0, -0.6, 0);
        this.put(shin, box(0.6, 1.0, 0.25), M.yellow, 0, -0.6, 0.38);

        // Sports Car Wheels on Outer Calves
        const wheel = this.put(shin, cy(0.38, 0.38, 0.28, 16), M.tireRubber, side * 0.48, -0.6, -0.15, 0, 0, Math.PI / 2);
        this.put(wheel, cy(0.22, 0.22, 0.3, 12), M.chrome, 0, 0, 0);

        // Agile Stabilizer Boots
        this.put(shin, box(0.7, 0.35, 1.1), M.yellow, 0, -1.45, 0.2);

        return { hip, shin };
      };

      this.legR = makeBeeLeg(1);
      this.legL = makeBeeLeg(-1);
    }

    update(dt) {
      this.time += dt;

      // Agile athletic bounce
      const bounce = Math.abs(Math.sin(this.time * 4.2)) * 0.06;
      if (this.torso) this.torso.position.y = 0.35 + bounce;

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
        if (this.cannon) this.cannon.position.z = 0.1 - this.recoil * 0.35;
      }

      // Cyber blade slash
      if (this.bladeSlash > 0) {
        this.bladeSlash = Math.max(0, this.bladeSlash - dt * 4.0);
        if (this.armR) this.armR.rotation.x = Math.sin(this.bladeSlash * Math.PI) * 1.6;
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
              child.material.roughness = Math.min(child.material.roughness || 0.5, 0.45);
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
      if (this.head) this.head.position.y = 1.75 - p * 0.85;
      if (this.head) this.head.scale.set(1 - p * 0.8, 1 - p * 0.8, 1 - p * 0.8);

      if (this.wings) {
        this.wings.forEach(w => w.scale.set(1 - p * 0.9, 1 - p * 0.9, 1 - p * 0.9));
      }

      if (this.armR && this.armL) {
        this.armR.position.x = 1.35 - p * 0.35;
        this.armL.position.x = -1.35 + p * 0.35;
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
            m.dispose();
          } catch(e) {}
        });
      }
    }
  }

  // Expose global classes
  rootScope.OptimusPrimeMech = OptimusPrimeMech;
  rootScope.BumblebeeMech = BumblebeeMech;
})();

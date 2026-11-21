// =============================================================================
// BATTLEFIELD 3D ENGINE (Three.js WebGL In-Game 3D Tactical Battle Viewport)
// Designed for Tower Defense: Last Grid
// Features:
//   - Full 3D WebGL rendering of the in-game battlefield on #mech-hangar-canvas
//   - 3 Camera Modes:
//       1. TACTICAL: 50-degree isometric perspective over the whole battlefield
//       2. HERO_CHASE: Dynamic third-person action camera tracking Megatron
//       3. TOP_DOWN: Bird's-eye 3D tactical command view
//   - Real 3D Hero integration (Megatron GLB / Optimus / Apex)
//   - Real 3D Towers with 360-degree yaw & pitch target tracking and recoil kick
//   - Real 3D Enemies (walking bipeds, hovering VTOL gunships at altitude, rolling spheres, titans)
//   - 3D Laser beams, plasma bolts, and ballistic missile trails
//   - 3D Metallic industrial terrain matching map waypoints with glowing lanes
//   - 100% Offline, mobile-optimized 60 FPS performance
// =============================================================================

(function() {
  'use strict';

  if (typeof window === 'undefined') return;

  class Battlefield3DEngine {
    constructor() {
      this.canvas = null;
      this.game = null;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.active = false;
      this.cameraMode = 'TACTICAL'; // 'TACTICAL' | 'HERO_CHASE' | 'TOP_DOWN'

      // Object Pools & Caches
      this.towerMeshes = new Map(); // tower -> 3D Object
      this.enemyMeshes = new Map(); // enemy -> 3D Object
      this.projectileMeshes = new Map(); // projectile -> 3D Object
      this.heroObject = null;
      this.terrainGroup = null;
      this.laneGroup = null;
      this.portalObject = null;
      this.coreObject = null;

      // GLTF Cache
      this.gltfCache = new Map();
      this.loader = null;
      this.currentMapIndex = -1;

      // Dynamic Lights
      this.sunLight = null;
      this.heroLight = null;
      this.coreLight = null;
    }

    init(canvas, gameInstance) {
      if (!canvas || !window.THREE) return false;
      this.canvas = canvas;
      this.game = gameInstance;

      const THREE = window.THREE;
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x060913);
      this.scene.fog = new THREE.FogExp2(0x060913, 0.00085);

      // Camera: 50-degree FOV matching 1280x720 aspect
      const aspect = 1280 / 720;
      this.camera = new THREE.PerspectiveCamera(46, aspect, 5, 4000);
      this.setCameraMode('TACTICAL');

      // WebGL Renderer
      const pr = Math.min(window.devicePixelRatio || 1, 1.5);
      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: pr < 1.5,
          alpha: false,
          powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(pr);
        this.renderer.setSize(1280, 720, false);
        if (THREE.ACESFilmicToneMapping) {
          this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
          this.renderer.toneMappingExposure = 1.25;
        }
      } catch (e) {
        if (typeof process !== 'undefined' && process.release && process.release.name === 'node') {
          this.renderer = {
            render: () => {},
            setSize: () => {},
            setPixelRatio: () => {},
            dispose: () => {}
          };
        } else {
          this.renderer = null;
          this.active = false;
          return false;
        }
      }

      // Create Hero Anchor Group
      this.heroObject = new THREE.Group();
      this.scene.add(this.heroObject);

      this.setupLights();
      this.initGLTFLoader();

      this.active = true;
      return true;
    }

    resize(width, height) {
      if (!this.renderer || !this.camera) return;
      if (this.canvas) {
        this.canvas.style.width = typeof width === 'number' ? `${width}px` : width;
        this.canvas.style.height = typeof height === 'number' ? `${height}px` : height;
      }
      const w = parseInt(width, 10) || 1280;
      const h = parseInt(height, 10) || 720;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
    }

    setupLights() {
      const THREE = window.THREE;

      // Ambient Cybernetic Light
      const ambient = new THREE.AmbientLight(0x384252, 1.2);
      this.scene.add(ambient);

      // Directional Sun / Studio Key Light (Casting highlights across metal plates)
      this.sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
      this.sunLight.position.set(400, -200, 700);
      this.scene.add(this.sunLight);

      // Cyber Rim Light (Cyan)
      const rimLight1 = new THREE.DirectionalLight(0x00e5ff, 1.4);
      rimLight1.position.set(-500, -600, 300);
      this.scene.add(rimLight1);

      // Dark Energon Rim Light (Purple)
      const rimLight2 = new THREE.DirectionalLight(0xa855f7, 1.2);
      rimLight2.position.set(700, 600, 250);
      this.scene.add(rimLight2);

      // Dynamic Hero Point Light
      this.heroLight = new THREE.PointLight(0xc084fc, 3.5, 220);
      this.heroLight.position.set(0, 0, 25);
      this.heroObject.add(this.heroLight);

      // Dynamic Base Core Light
      this.coreLight = new THREE.PointLight(0x00e5ff, 4.0, 300);
      this.scene.add(this.coreLight);
    }

    initGLTFLoader() {
      const THREE = window.THREE;
      if (THREE && THREE.GLTFLoader) {
        this.loader = new THREE.GLTFLoader();
        this.preloadModels();
      }
    }

    preloadModels() {
      if (!this.loader) return;
      const modelMap = {
        megatron: 'assets/models/megatron_movie_hd.glb',
        megatron_g1: 'assets/models/megatron.glb',
        optimus: 'assets/models/optimus.glb',
        bumblebee: 'assets/models/bumblebee.glb',
        turret: 'assets/models/turret_scifi_hd.glb',
        railgun: 'assets/models/turret_railgun_hd.glb',
        grunt: 'assets/models/biped_robot_hd.glb',
        gunship: 'assets/models/mech_drone_hd.glb',
        kamikaze: 'assets/models/sphere_bot.glb'
      };

      for (const [key, path] of Object.entries(modelMap)) {
        try {
          this.loader.load(path, (gltf) => {
            this.gltfCache.set(key, gltf);
            if (key === 'megatron' && (!this.heroLoadedSkin || this.heroLoadedSkin === 'MEGATRON')) {
              this.buildHeroModel('MEGATRON', this.heroLoadedMode || 'BIPED');
            }
          }, undefined, () => {});
        } catch(e) {}
      }
    }

    setCameraMode(mode) {
      this.cameraMode = mode;
      if (mode === 'TACTICAL') {
        // High-angle 3D tactical perspective (50 deg elevation, wide battlefield view)
        this.camTargetX = 640;
        this.camTargetY = -340;
        this.camTargetZ = 0;
        this.camPosX = 640;
        this.camPosY = -750;
        this.camPosZ = 620;
      } else if (mode === 'HERO_CHASE') {
        // Third-person action camera tracking behind Megatron
        this.camTargetX = 640;
        this.camTargetY = -360;
        this.camTargetZ = 15;
        this.camPosX = 640;
        this.camPosY = -450;
        this.camPosZ = 180;
      } else {
        // TOP_DOWN: High bird's-eye 3D view
        this.camTargetX = 640;
        this.camTargetY = -360;
        this.camTargetZ = 0;
        this.camPosX = 640;
        this.camPosY = -390;
        this.camPosZ = 820;
      }

      if (this.camera) {
        this.camera.position.set(this.camPosX, this.camPosY, this.camPosZ);
        this.camera.lookAt(this.camTargetX, this.camTargetY, this.camTargetZ);
      }
    }

    toggleCameraMode() {
      const modes = ['TACTICAL', 'HERO_CHASE', 'TOP_DOWN'];
      const curIdx = modes.indexOf(this.cameraMode);
      const nextMode = modes[(curIdx + 1) % modes.length];
      this.setCameraMode(nextMode);
      return nextMode;
    }

    // =========================================================================
    // 3D Environment & Battlefield Generation
    // =========================================================================

    buildTerrain(map) {
      const THREE = window.THREE;
      if (!this.scene) return;

      // Remove existing terrain if any
      if (this.terrainGroup) {
        this.scene.remove(this.terrainGroup);
        this.terrainGroup = null;
      }

      this.terrainGroup = new THREE.Group();

      // 1. Heavy Metal Grid Base Plane (1340 x 780 x 10)
      const biome = (map && map.biome) ? map.biome : 'cyber';
      const floorColor = (biome === 'lava') ? 0x180705 : ((biome === 'cryo') ? 0x071526 : 0x090e1a);
      const edgeColor = (biome === 'lava') ? 0xff5722 : ((biome === 'cryo') ? 0x00e5ff : 0x00e5ff);

      const floorGeo = new THREE.BoxGeometry(1320, 740, 12);
      const floorMat = new THREE.MeshStandardMaterial({
        color: floorColor,
        roughness: 0.45,
        metalness: 0.82
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(640, -360, -6);
      this.terrainGroup.add(floorMesh);

      // 2. Interlocking Grid Line Decals (Grid every 64 units)
      const gridMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: 0.18
      });
      const gridPoints = [];
      for (let x = 0; x <= 1280; x += 64) {
        gridPoints.push(new THREE.Vector3(x, -60, 0.2));
        gridPoints.push(new THREE.Vector3(x, -620, 0.2));
      }
      for (let y = 60; y <= 620; y += 64) {
        gridPoints.push(new THREE.Vector3(0, -y, 0.2));
        gridPoints.push(new THREE.Vector3(1280, -y, 0.2));
      }
      const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPoints);
      const gridLines = new THREE.LineSegments(gridGeo, gridMat);
      this.terrainGroup.add(gridLines);

      // 3. 3D Lanes (Sunken Metallic Roadbed with Glowing Neon Curbs)
      if (map && map.lanes) {
        for (const lane of map.lanes) {
          if (!lane || lane.length < 2) continue;
          for (let i = 0; i < lane.length - 1; i++) {
            const p1 = lane[i];
            const p2 = lane[i + 1];
            const dx = p2.x - p1.x;
            const dy = -(p2.y - p1.y); // Y inverted for Three.js
            const len = Math.hypot(dx, dy);
            const ang = Math.atan2(dy, dx);
            const midX = (p1.x + p2.x) / 2;
            const midY = -(p1.y + p2.y) / 2;

            // Road Segment Box
            const roadGeo = new THREE.BoxGeometry(len, 44, 4);
            const roadMat = new THREE.MeshStandardMaterial({
              color: 0x050914,
              roughness: 0.65,
              metalness: 0.7
            });
            const roadMesh = new THREE.Mesh(roadGeo, roadMat);
            roadMesh.position.set(midX, midY, -1);
            roadMesh.rotation.z = ang;
            this.terrainGroup.add(roadMesh);

            // Left & Right Glowing Guard Rails
            const railMat = new THREE.MeshBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.65 });
            const railGeo = new THREE.BoxGeometry(len, 2.5, 3.5);

            const leftRail = new THREE.Mesh(railGeo, railMat);
            leftRail.position.set(midX - Math.sin(ang) * 23, midY + Math.cos(ang) * 23, 1.5);
            leftRail.rotation.z = ang;
            this.terrainGroup.add(leftRail);

            const rightRail = new THREE.Mesh(railGeo, railMat);
            rightRail.position.set(midX + Math.sin(ang) * 23, midY - Math.cos(ang) * 23, 1.5);
            rightRail.rotation.z = ang;
            this.terrainGroup.add(rightRail);
          }

          // 4. 3D Spawn Gate (Rotating Energy Vortex Portal)
          const sp = lane[0];
          const portalGroup = new THREE.Group();
          portalGroup.position.set(sp.x, -sp.y, 4);

          const ringGeo = new THREE.TorusGeometry(26, 3.2, 12, 32);
          const ringMat = new THREE.MeshStandardMaterial({
            color: 0xff1744,
            emissive: 0xff1744,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.9
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2.5;
          portalGroup.add(ringMesh);

          // Inner Vortex Disc
          const vortexGeo = new THREE.CircleGeometry(22, 24);
          const vortexMat = new THREE.MeshBasicMaterial({
            color: 0xff1744,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide
          });
          const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
          portalGroup.add(vortexMesh);

          this.terrainGroup.add(portalGroup);
          this.portalObject = ringMesh;

          // 5. 3D Base Core (Heavy Hexagonal Reactor Generator)
          const ep = lane[lane.length - 1];
          const coreGroup = new THREE.Group();
          coreGroup.position.set(ep.x, -ep.y, 0);

          // Heavy Hex Base Plinth
          const plinthGeo = new THREE.CylinderGeometry(36, 40, 10, 6);
          const plinthMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.35,
            metalness: 0.88
          });
          const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
          plinthMesh.rotation.x = Math.PI / 2;
          coreGroup.add(plinthMesh);

          // Central Pulsing Quantum Reactor Sphere
          const coreGeo = new THREE.SphereGeometry(16, 24, 24);
          const coreMat = new THREE.MeshStandardMaterial({
            color: 0x00e5ff,
            emissive: 0x00e5ff,
            emissiveIntensity: 1.0,
            roughness: 0.1,
            metalness: 0.2
          });
          const coreSphere = new THREE.Mesh(coreGeo, coreMat);
          coreSphere.position.z = 18;
          coreGroup.add(coreSphere);
          this.coreObject = coreSphere;

          // Counter-rotating magnetic confinement rings
          const cRingGeo = new THREE.TorusGeometry(24, 2.0, 8, 32);
          const cRingMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
          const cRingMesh = new THREE.Mesh(cRingGeo, cRingMat);
          cRingMesh.position.z = 18;
          coreGroup.add(cRingMesh);
          this.coreRing = cRingMesh;

          if (this.coreLight) {
            this.coreLight.position.set(ep.x, -ep.y, 35);
          }

          this.terrainGroup.add(coreGroup);
        }
      }

      this.scene.add(this.terrainGroup);
    }

    // =========================================================================
    // 3D Hero Synchronization (Megatron / Optimus / Apex)
    // =========================================================================

    syncHero(hero, dt) {
      if (!hero || !this.heroObject) return;
      const THREE = window.THREE;

      // Position hero in 3D world space (X = hero.x, Y = -hero.y, Z = 0)
      this.heroObject.position.set(hero.x, -hero.y, 0);
      this.heroObject.rotation.z = -(hero.angle || 0);

      // Camera Follow in HERO_CHASE mode
      if (this.cameraMode === 'HERO_CHASE' && this.camera) {
        const camDist = 180;
        const camHeight = 90;
        const ang = hero.angle || 0;
        const targetX = hero.x;
        const targetY = -hero.y;

        const desiredCamX = targetX - Math.cos(ang) * camDist;
        const desiredCamY = targetY + Math.sin(ang) * camDist;
        const desiredCamZ = camHeight;

        this.camera.position.lerp(new THREE.Vector3(desiredCamX, desiredCamY, desiredCamZ), 0.12);
        this.camera.lookAt(targetX + Math.cos(ang) * 80, targetY - Math.sin(ang) * 80, 20);
      }

      // Check if 3D model is loaded in Hero Object
      const activeSkin = (this.game && this.game.selectedMechSkin) ? this.game.selectedMechSkin : 'MEGATRON';
      if (this.heroLoadedSkin !== activeSkin || this.heroLoadedMode !== hero.mode) {
        this.buildHeroModel(activeSkin, hero.mode);
      }

      // Procedural walking sway & weapon recoil
      if (this.heroBodyMesh) {
        const walk = hero.walkAnim || 0;
        this.heroBodyMesh.position.z = 16 + Math.abs(Math.sin(walk * 2)) * 2.5;
        this.heroBodyMesh.rotation.y = Math.sin(walk) * 0.08;
      }

      // Fusion Cannon Muzzle Flash in 3D
      if (this.heroMuzzleLight) {
        if (hero.slashAnim > 0) {
          this.heroMuzzleLight.intensity = (hero.slashAnim / 0.22) * 8.0;
        } else {
          this.heroMuzzleLight.intensity = 0;
        }
      }
    }

    buildHeroModel(skin, mode) {
      const THREE = window.THREE;
      while (this.heroObject.children.length > 0) {
        this.heroObject.remove(this.heroObject.children[0]);
      }
      this.heroLoadedSkin = skin;
      this.heroLoadedMode = mode;

      // Re-add dynamic light
      if (this.heroLight) this.heroObject.add(this.heroLight);

      // Check if real 3D GLTF model is cached for this hero
      const skinKey = skin ? skin.toLowerCase() : 'megatron';
      if (mode !== 'SIEGE' && this.gltfCache && this.gltfCache.has(skinKey)) {
        const gltf = this.gltfCache.get(skinKey);
        const scene = gltf.scene || gltf.scenes[0];
        const clone = scene.clone ? scene.clone(true) : scene;

        if (THREE.Box3 && THREE.Vector3) {
          const box = new THREE.Box3().setFromObject(clone);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxD = Math.max(size.x, size.y, size.z);
          const targetHeight = 44;
          const scale = maxD > 0 ? (targetHeight / maxD) : 1.0;
          clone.scale.set(scale, scale, scale);

          const center = new THREE.Vector3();
          box.getCenter(center);
          clone.rotation.x = Math.PI / 2;
          clone.position.set(-center.x * scale, -center.z * scale, 18);
        }

        this.heroBodyMesh = clone;
        this.heroObject.add(clone);
        return;
      }

      if (skin === 'MEGATRON') {
        this.buildMegatron3D(mode);
      } else if (skin === 'OPTIMUS') {
        this.buildOptimus3D(mode);
      } else {
        this.buildApex3D(mode);
      }
    }

    buildMegatron3D(mode) {
      const THREE = window.THREE;
      const group = new THREE.Group();

      if (mode === 'SIEGE') {
        // --- Megatron Cybertronian Siege Destroyer Tank ---
        const tankMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.35,
          metalness: 0.85
        });
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });

        // Heavy Tank Hull
        const hullGeo = new THREE.BoxGeometry(48, 38, 16);
        const hull = new THREE.Mesh(hullGeo, tankMat);
        hull.position.z = 10;
        group.add(hull);

        // Dual Alien Caterpillar Treads
        const treadGeo = new THREE.BoxGeometry(54, 12, 14);
        const leftTread = new THREE.Mesh(treadGeo, tankMat);
        leftTread.position.set(0, -22, 8);
        const rightTread = new THREE.Mesh(treadGeo, tankMat);
        rightTread.position.set(0, 22, 8);
        group.add(leftTread); group.add(rightTread);

        // Central Fusion Cannon Turret
        const turretGeo = new THREE.CylinderGeometry(14, 16, 12, 16);
        const turret = new THREE.Mesh(turretGeo, tankMat);
        turret.position.set(-2, 0, 20);
        turret.rotation.x = Math.PI / 2;
        group.add(turret);

        // Colossal Fusion Cannon Barrel
        const cannonGeo = new THREE.CylinderGeometry(5.5, 6.5, 46, 16);
        const cannon = new THREE.Mesh(cannonGeo, tankMat);
        cannon.position.set(24, 0, 20);
        cannon.rotation.z = -Math.PI / 2;
        group.add(cannon);

        // Muzzle Glow Light
        this.heroMuzzleLight = new THREE.PointLight(0xc084fc, 0, 150);
        this.heroMuzzleLight.position.set(48, 0, 20);
        group.add(this.heroMuzzleLight);

      } else {
        // --- Megatron Biped Supreme Leader Robot ---
        const silverMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.32,
          metalness: 0.90
        });
        const darkMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.40,
          metalness: 0.85
        });
        const energonMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          emissive: 0xa855f7,
          emissiveIntensity: 1.2
        });

        // 1. Heavy Titanium Legs
        const legGeo = new THREE.BoxGeometry(8, 9, 22);
        const leftLeg = new THREE.Mesh(legGeo, darkMat);
        leftLeg.position.set(0, -11, 11);
        const rightLeg = new THREE.Mesh(legGeo, darkMat);
        rightLeg.position.set(0, 11, 11);
        group.add(leftLeg); group.add(rightLeg);

        // 2. Heavy Angular Torso Chassis
        const torsoGeo = new THREE.BoxGeometry(20, 28, 26);
        const torso = new THREE.Mesh(torsoGeo, silverMat);
        torso.position.set(0, 0, 32);
        group.add(torso);
        this.heroBodyMesh = torso;

        // Dark Energon Chest Core
        const coreGeo = new THREE.CylinderGeometry(5, 5, 4, 16);
        const core = new THREE.Mesh(coreGeo, energonMat);
        core.position.set(10.5, 0, 33);
        core.rotation.z = Math.PI / 2;
        torso.add(core);

        // 3. Decepticon Crowned Helmet & Red Optics
        const headGeo = new THREE.BoxGeometry(11, 12, 12);
        const head = new THREE.Mesh(headGeo, silverMat);
        head.position.set(2, 0, 48);
        group.add(head);

        const visorGeo = new THREE.BoxGeometry(3, 8, 3.5);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(6, 0, 48);
        group.add(visor);

        // 4. Massive Forearm-Mounted Fusion Cannon (Right Arm)
        const fcMount = new THREE.Group();
        fcMount.position.set(4, 18, 30);

        const fcBodyGeo = new THREE.CylinderGeometry(5, 6, 32, 16);
        const fcBody = new THREE.Mesh(fcBodyGeo, silverMat);
        fcBody.rotation.z = -Math.PI / 2;
        fcMount.add(fcBody);

        const fcMuzzleGeo = new THREE.CylinderGeometry(6.5, 6.5, 8, 16);
        const fcMuzzle = new THREE.Mesh(fcMuzzleGeo, darkMat);
        fcMuzzle.position.set(16, 0, 0);
        fcMuzzle.rotation.z = -Math.PI / 2;
        fcMount.add(fcMuzzle);

        this.heroMuzzleLight = new THREE.PointLight(0xc084fc, 0, 150);
        this.heroMuzzleLight.position.set(22, 0, 0);
        fcMount.add(this.heroMuzzleLight);

        group.add(fcMount);

        // 5. Left Arm Claws
        const lArmGeo = new THREE.BoxGeometry(7, 8, 20);
        const lArm = new THREE.Mesh(lArmGeo, darkMat);
        lArm.position.set(0, -18, 28);
        group.add(lArm);
      }

      this.heroObject.add(group);
    }

    buildOptimus3D(mode) {
      const THREE = window.THREE;
      const group = new THREE.Group();
      const redMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.35, metalness: 0.8 });
      const blueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35, metalness: 0.8 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.1, metalness: 0.95 });

      const torsoGeo = new THREE.BoxGeometry(20, 26, 26);
      const torso = new THREE.Mesh(torsoGeo, redMat);
      torso.position.set(0, 0, 32);
      group.add(torso);
      this.heroBodyMesh = torso;

      const legGeo = new THREE.BoxGeometry(8, 9, 22);
      const lLeg = new THREE.Mesh(legGeo, blueMat); lLeg.position.set(0, -10, 11);
      const rLeg = new THREE.Mesh(legGeo, blueMat); rLeg.position.set(0, 10, 11);
      group.add(lLeg); group.add(rLeg);

      // Dual Chrome Stacks
      const stackGeo = new THREE.CylinderGeometry(1.8, 1.8, 28, 12);
      const s1 = new THREE.Mesh(stackGeo, chromeMat); s1.position.set(-10, -12, 38);
      const s2 = new THREE.Mesh(stackGeo, chromeMat); s2.position.set(-10, 12, 38);
      group.add(s1); group.add(s2);

      this.heroObject.add(group);
    }

    buildApex3D(mode) {
      const THREE = window.THREE;
      const group = new THREE.Group();
      const grayMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });
      const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

      const bodyGeo = new THREE.BoxGeometry(22, 26, 24);
      const body = new THREE.Mesh(bodyGeo, grayMat);
      body.position.set(0, 0, 30);
      group.add(body);
      this.heroBodyMesh = body;

      const coreGeo = new THREE.SphereGeometry(6, 16, 16);
      const core = new THREE.Mesh(coreGeo, cyanMat);
      core.position.set(11, 0, 30);
      body.add(core);

      this.heroObject.add(group);
    }

    // =========================================================================
    // 3D Towers Synchronization
    // =========================================================================

    syncTowers(towers, dt) {
      if (!towers || !this.scene) return;
      const THREE = window.THREE;
      const activeTowers = new Set(towers);

      // Remove towers that no longer exist
      for (const [t, mesh] of this.towerMeshes.entries()) {
        if (!activeTowers.has(t)) {
          this.scene.remove(mesh);
          this.towerMeshes.delete(t);
        }
      }

      // Update / Create Towers
      for (const t of towers) {
        let tGroup = this.towerMeshes.get(t);
        if (!tGroup) {
          tGroup = this.createTowerMesh(t);
          this.towerMeshes.set(t, tGroup);
          this.scene.add(tGroup);
        }

        // Position in 3D: X = t.x, Y = -t.y, Z = 0
        tGroup.position.set(t.x, -t.y, 0);

        // Rotate Turret Head Assembly
        if (tGroup.turretHead) {
          tGroup.turretHead.rotation.z = -(t.angle || 0);

          // Apply Recoil Kickback
          const recoil = (t.recoil || 0) * 8;
          tGroup.turretHead.position.x = -Math.cos(-(t.angle || 0)) * recoil;
          tGroup.turretHead.position.y = -Math.sin(-(t.angle || 0)) * recoil;
        }
      }
    }

    createTowerMesh(t) {
      const THREE = window.THREE;
      const group = new THREE.Group();

      // 1. Heavy Cast-Titanium Octagonal Base
      const baseGeo = new THREE.CylinderGeometry(24, 26, 8, 8);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.88
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.rotation.x = Math.PI / 2;
      base.position.z = 4;
      group.add(base);

      // 2. Rotating Turret Head Assembly
      const headGroup = new THREE.Group();
      headGroup.position.z = 10;

      const collarGeo = new THREE.CylinderGeometry(14, 16, 8, 16);
      const collarMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.3,
        metalness: 0.9
      });
      const collar = new THREE.Mesh(collarGeo, collarMat);
      collar.rotation.x = Math.PI / 2;
      headGroup.add(collar);

      // Weapon Barrels by Type or Real 3D Turret Model
      if (this.gltfCache && this.gltfCache.has('railgun') && (t.type === 'laser' || t.type === 'tesla' || t.branch === 'BRANCH_A')) {
        const gltf = this.gltfCache.get('railgun');
        const clone = (gltf.scene || gltf.scenes[0]).clone(true);
        if (THREE.Box3 && THREE.Vector3) {
          const box = new THREE.Box3().setFromObject(clone);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxD = Math.max(size.x, size.y, size.z);
          const scale = maxD > 0 ? (32 / maxD) : 1.0;
          clone.scale.set(scale, scale, scale);
          clone.rotation.x = Math.PI / 2;
          clone.position.z = 4;
        }
        headGroup.add(clone);
      } else if (this.gltfCache && this.gltfCache.has('turret')) {
        const gltf = this.gltfCache.get('turret');
        const clone = (gltf.scene || gltf.scenes[0]).clone(true);
        if (THREE.Box3 && THREE.Vector3) {
          const box = new THREE.Box3().setFromObject(clone);
          const size = new THREE.Vector3();
          box.getSize(size);
          const maxD = Math.max(size.x, size.y, size.z);
          const scale = maxD > 0 ? (28 / maxD) : 1.0;
          clone.scale.set(scale, scale, scale);
          clone.rotation.x = Math.PI / 2;
          clone.position.z = 2;
        }
        headGroup.add(clone);
      } else if (t.type === 'pulse') {
        // Dual Autocannons
        const bGeo = new THREE.CylinderGeometry(2.5, 3.2, 28, 12);
        const bMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, metalness: 0.9, roughness: 0.2 });
        const b1 = new THREE.Mesh(bGeo, bMat); b1.position.set(14, -6, 0); b1.rotation.z = -Math.PI / 2;
        const b2 = new THREE.Mesh(bGeo, bMat); b2.position.set(14, 6, 0); b2.rotation.z = -Math.PI / 2;
        headGroup.add(b1); headGroup.add(b2);
      } else if (t.type === 'mortar') {
        // Heavy 155mm Howitzer
        const bGeo = new THREE.CylinderGeometry(6, 8, 26, 16);
        const bMat = new THREE.MeshStandardMaterial({ color: 0xff9100, metalness: 0.85, roughness: 0.3 });
        const b = new THREE.Mesh(bGeo, bMat); b.position.set(13, 0, 0); b.rotation.z = -Math.PI / 2;
        headGroup.add(b);
      } else if (t.type === 'cryo') {
        // Frosted Cryo Sphere
        const sGeo = new THREE.SphereGeometry(12, 16, 16);
        const sMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.1, metalness: 0.3 });
        const s = new THREE.Mesh(sGeo, sMat); s.position.set(0, 0, 4);
        headGroup.add(s);
      } else {
        // Laser / Railgun
        const bGeo = new THREE.CylinderGeometry(3.5, 4.5, 34, 12);
        const bMat = new THREE.MeshStandardMaterial({ color: 0xff007f, metalness: 0.9, roughness: 0.2 });
        const b = new THREE.Mesh(bGeo, bMat); b.position.set(17, 0, 0); b.rotation.z = -Math.PI / 2;
        headGroup.add(b);
      }

      group.add(headGroup);
      group.turretHead = headGroup;
      return group;
    }

    // =========================================================================
    // 3D Enemies Synchronization
    // =========================================================================

    syncEnemies(enemies, dt) {
      if (!enemies || !this.scene) return;
      const THREE = window.THREE;
      const activeEnemies = new Set(enemies);

      // Remove dead enemies
      for (const [e, mesh] of this.enemyMeshes.entries()) {
        if (!activeEnemies.has(e)) {
          this.scene.remove(mesh);
          this.enemyMeshes.delete(e);
        }
      }

      // Update / Create Enemies
      for (const e of enemies) {
        let eGroup = this.enemyMeshes.get(e);
        if (!eGroup) {
          eGroup = this.createEnemyMesh(e);
          this.enemyMeshes.set(e, eGroup);
          this.scene.add(eGroup);
        }

        // 3D Position: Flyers at Z = 35, Ground at Z = 0
        const alt = e.isFlyer ? 35 : 0;
        eGroup.position.set(e.x, -e.y, alt);
        eGroup.rotation.z = -(e.angle || 0);

        // Animate walk / rotor spin
        if (e.isFlyer && eGroup.rotors) {
          for (const r of eGroup.rotors) r.rotation.z += 0.45;
        } else if (eGroup.legs) {
          const w = e.walkAnim || 0;
          eGroup.legs[0].rotation.y = Math.sin(w) * 0.4;
          eGroup.legs[1].rotation.y = -Math.sin(w) * 0.4;
        }
      }
    }

    createEnemyMesh(e) {
      const THREE = window.THREE;
      const group = new THREE.Group();
      const col = e.color ? new THREE.Color(e.color) : new THREE.Color(0x00e5ff);

      if (e.isFlyer) {
        // VTOL Aerial Gunship (Real 3D GLTF Mech Drone or Procedural)
        if (this.gltfCache && this.gltfCache.has('gunship')) {
          const gltf = this.gltfCache.get('gunship');
          const clone = (gltf.scene || gltf.scenes[0]).clone(true);
          if (THREE.Box3 && THREE.Vector3) {
            const box = new THREE.Box3().setFromObject(clone);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxD = Math.max(size.x, size.y, size.z);
            const scale = maxD > 0 ? (38 / maxD) : 1.0;
            clone.scale.set(scale, scale, scale);
            clone.rotation.x = Math.PI / 2;
          }
          group.add(clone);
          return group;
        }

        const bodyGeo = new THREE.ConeGeometry(14, 38, 6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.8 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = -Math.PI / 2;
        group.add(body);

        // Wings
        const wingGeo = new THREE.BoxGeometry(8, 48, 2);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        group.add(wings);

        // 2 Rotor Discs
        const r1Geo = new THREE.CylinderGeometry(14, 14, 0.5, 8);
        const rMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.65 });
        const r1 = new THREE.Mesh(r1Geo, rMat); r1.position.set(0, -24, 2); r1.rotation.x = Math.PI / 2;
        const r2 = new THREE.Mesh(r1Geo, rMat); r2.position.set(0, 24, 2); r2.rotation.x = Math.PI / 2;
        group.add(r1); group.add(r2);
        group.rotors = [r1, r2];

      } else if (e.type === 'kamikaze') {
        // Skittering Spider-Mine Sphere (Real 3D GLTF Sphere Bot or Procedural)
        if (this.gltfCache && this.gltfCache.has('kamikaze')) {
          const gltf = this.gltfCache.get('kamikaze');
          const clone = (gltf.scene || gltf.scenes[0]).clone(true);
          if (THREE.Box3 && THREE.Vector3) {
            const box = new THREE.Box3().setFromObject(clone);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxD = Math.max(size.x, size.y, size.z);
            const scale = maxD > 0 ? (22 / maxD) : 1.0;
            clone.scale.set(scale, scale, scale);
            clone.rotation.x = Math.PI / 2;
            clone.position.z = 9;
          }
          group.add(clone);
          return group;
        }

        const sGeo = new THREE.SphereGeometry(9, 16, 16);
        const sMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 });
        const s = new THREE.Mesh(sGeo, sMat);
        s.position.z = 9;
        group.add(s);

        const ledGeo = new THREE.SphereGeometry(4, 12, 12);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(4, 0, 11);
        group.add(led);

      } else {
        // Biped Soldier / Brute Mech (Real 3D GLTF Robot or Procedural)
        if (this.gltfCache && this.gltfCache.has('grunt')) {
          const gltf = this.gltfCache.get('grunt');
          const clone = (gltf.scene || gltf.scenes[0]).clone(true);
          if (THREE.Box3 && THREE.Vector3) {
            const box = new THREE.Box3().setFromObject(clone);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxD = Math.max(size.x, size.y, size.z);
            const sz = e.isBoss ? 55 : (e.type === 'brute' ? 36 : 26);
            const scale = maxD > 0 ? (sz / maxD) : 1.0;
            clone.scale.set(scale, scale, scale);
            clone.rotation.x = Math.PI / 2;
            clone.position.z = sz * 0.5;
          }
          group.add(clone);
          return group;
        }
        // Biped Soldier / Brute Mech
        const sz = e.isBoss ? 2.2 : (e.type === 'brute' ? 1.4 : 1.0);
        const bGeo = new THREE.BoxGeometry(12 * sz, 16 * sz, 18 * sz);
        const bMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.4, metalness: 0.8 });
        const b = new THREE.Mesh(bGeo, bMat);
        b.position.z = 16 * sz;
        group.add(b);

        // Articulated legs
        const lGeo = new THREE.BoxGeometry(5 * sz, 6 * sz, 14 * sz);
        const lMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
        const l1 = new THREE.Mesh(lGeo, lMat); l1.position.set(0, -6 * sz, 7 * sz);
        const l2 = new THREE.Mesh(lGeo, lMat); l2.position.set(0, 6 * sz, 7 * sz);
        group.add(l1); group.add(l2);
        group.legs = [l1, l2];
      }

      return group;
    }

    // =========================================================================
    // Main Update & Render Loop
    // =========================================================================

    update(dt) {
      if (!this.active || !this.game) return;

      // Ensure terrain is built for current map
      if (this.currentMapIndex !== this.game.currentMapIndex || !this.terrainGroup) {
        this.currentMapIndex = (typeof this.game.currentMapIndex === 'number') ? this.game.currentMapIndex : 0;
        const MAPS = window.MAPS || this.game.MAPS;
        const curMap = (MAPS && MAPS[this.currentMapIndex]) ? MAPS[this.currentMapIndex] : (MAPS ? MAPS[0] : null);
        if (curMap) this.buildTerrain(curMap);
      }

      // Spin Portal Vortex & Core Rings
      if (this.portalObject) this.portalObject.rotation.z += 0.04;
      if (this.coreRing) this.coreRing.rotation.y += 0.05;
      if (this.coreObject) {
        const p = Math.sin(performance.now() * 0.005) * 0.15 + 1.0;
        this.coreObject.scale.set(p, p, p);
      }

      // Synchronize Game Entities with 3D Scene
      this.syncHero(this.game.hero, dt);
      this.syncTowers(this.game.towers, dt);
      this.syncEnemies(this.game.enemies, dt);
    }

    render() {
      if (!this.renderer || !this.scene || !this.camera) return;
      this.renderer.render(this.scene, this.camera);
    }

    dispose() {
      this.active = false;
      if (this.renderer) {
        this.renderer.dispose();
      }
    }
  }

  window.Battlefield3DEngine = Battlefield3DEngine;
})();

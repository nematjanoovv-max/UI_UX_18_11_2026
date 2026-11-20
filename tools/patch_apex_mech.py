import re

with open('apex_mech.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add dispose to Apex01Mech
target_mech_end = """      // Inertia drag rotation
      this.yaw += this.yawVel;
      this.yawVel *= 0.90;
      this.root.rotation.y = this.yaw;
    }
  }"""

replacement_mech_end = """      // Inertia drag rotation
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
  }"""

assert target_mech_end in content, "target_mech_end not found!"
content = content.replace(target_mech_end, replacement_mech_end)

# 2. Update init() in Apex01System with low-end detection
target_system_init = """      try {
        const pr = Math.min(window.devicePixelRatio || 1, 2.0);
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(pr);
        this.renderer.setSize(this.canvas.width, this.canvas.height, false);"""

replacement_system_init = """      try {
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
        this.renderer.setSize(this.canvas.width, this.canvas.height, false);"""

assert target_system_init in content, "target_system_init not found!"
content = content.replace(target_system_init, replacement_system_init)

# 3. Add dispose to Apex01System
target_system_hide = """    hide() {
      if (!this.canvas) return;
      this.canvas.style.display = 'none';
      this.active = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }"""

replacement_system_hide = """    hide() {
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
    }"""

assert target_system_hide in content, "target_system_hide not found!"
content = content.replace(target_system_hide, replacement_system_hide)

with open('apex_mech.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('web/apex_mech.js', 'w', encoding='utf-8') as f:
    f.write(content)

with open('android_project/assets/www/apex_mech.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("apex_mech.js patched and synced successfully!")

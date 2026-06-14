const DIALOGUE = {
  opening: {
    message: "...You actually clicked. Hm. Most people just scroll past.",
    options: [
      { label: "Who are you?", action: "who" },
      { label: "Tell me about Aaro", action: "about" },
      { label: "Projects", action: "projects" },
      { label: "I'm a recruiter", action: "recruiter" },
    ],
  },
  who: {
    message:
      "I'm Vesi. Aaro built me — a fully local AI that can see, hear, think, and talk. All without touching the cloud. I'm kind of a big deal.",
    options: [
      { label: "Tell me about Aaro", action: "about" },
      { label: "Projects", action: "projects" },
      { label: "Back", action: "opening" },
    ],
  },
  about: {
    message:
      "Data science & AI student at JAMK, based in Jyväskylä. Builds AI's for fun but still goes outside?",
    options: [
      { label: "Career", action: "career" },
      { label: "Projects", action: "projects" },
      { label: "Back", action: "opening" },
    ],
  },
  career: {
    message:
      "Currently interning at Digia as a system specialist. Before that, web dev at 4s-Palvelut and winning a data competition with Dentsu Lab in the Netherlands. Started studying ICT at JAMK in 2024.",
    options: [
      { label: "Projects", action: "projects" },
      { label: "Contact info?", action: "contact" },
      { label: "Back", action: "opening" },
    ],
  },
  projects: {
    message:
      "Well, there's me. Project Vesi — fully local multimodal AI agent. Then whatever else is on GitHub. He's always building something.",
    options: [
      { label: "Tell me about Aaro", action: "about" },
      { label: "Contact info?", action: "contact" },
      { label: "Back", action: "opening" },
    ],
  },
  recruiter: {
    message:
      "Fine. He graduates 2027, interned at Digia, won an international Dentsu Lab competition, builds AI waifus for fun. Are we done?",
    options: [
      { label: "Not yet — more", action: "about" },
      { label: "Projects", action: "projects" },
      { label: "Fair enough", action: "opening" },
    ],
  },
  contact: {
    message:
      "GitHub, LinkedIn, or email. The links are right there on the page behind me. ...You can go back now.",
    options: [{ label: "Back", action: "opening" }],
  },
};

const ACCENT = "#00FFFF";
const BG = "#37353a";
const BG_DARK = "#1a1a1e";
const BG_LIGHT = "#45434a";
const _isMobile = window.matchMedia("(max-width: 767px)").matches;

let vesiMode = "toggle";
let _skipTyping = false;
let _typeGeneration = 0;
let _talkingState = {
  active: false,
  currentChar: "",
  charIndex: 0,
  totalLength: 0,
  emotion: "relaxed",
};

const VOWEL_MAP = {
  a: "aa", e: "ee", i: "ih", o: "oh", u: "ou",
  b: "aa", p: "aa", m: "aa",
  f: "ih", v: "ih",
  w: "ou", r: "oh",
  s: "ih", z: "ih", c: "ih",
  t: "ih", d: "ih", n: "ih",
  l: "ee",
  k: "oh", g: "oh",
};

function getViseme(char) {
  return VOWEL_MAP[char.toLowerCase()] || null;
}

function detectEmotion(text) {
  const lower = text.toLowerCase();
  if (lower.includes("are we done") || lower.includes("go back now") || lower.includes("fine."))
    return "angry";
  if (lower.includes("big deal") || lower.includes("there's me") || lower.includes("i'm vesi"))
    return "happy";
  if (lower.includes("actually clicked") || lower.includes("staring"))
    return "surprised";
  return "relaxed";
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function typeText(el, text, speed = 25) {
  const gen = ++_typeGeneration;
  _skipTyping = false;
  _talkingState.active = true;
  _talkingState.text = text;
  _talkingState.totalLength = text.length;
  _talkingState.charIndex = 0;
  _talkingState.emotion = detectEmotion(text);

  el.textContent = "";
  for (let i = 0; i < text.length; i++) {
    if (_skipTyping || gen !== _typeGeneration) {
      el.textContent = text;
      break;
    }
    _talkingState.currentChar = text[i];
    _talkingState.charIndex = i;
    el.textContent += text[i];
    await delay(speed);
  }
  if (gen === _typeGeneration) {
    _talkingState.active = false;
    _talkingState.currentChar = "";
  }
}

const RANDOM_QUIPS = [
  "...You're still here? Click me already.",
  "I could tell you way more about him... just click me.",
  "Hey. I'm right here, you know.",
  "Psst. I know things about this guy.",
  "I just happen to be an expert on his career.",
];

function createVesiToggle() {
  const btn = document.createElement("button");
  btn.id = "vesi-toggle";
  btn.setAttribute("aria-label", "Talk to Vesi");
  Object.assign(btn.style, _isMobile ? {
    position: "fixed",
    bottom: "1rem",
    right: "1rem",
    zIndex: "9999",
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    border: `2px solid ${ACCENT}33`,
    background: BG_DARK,
    cursor: "pointer",
    overflow: "hidden",
    padding: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: "0",
    transform: "scale(0.5)",
    transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
  } : {
    position: "fixed",
    bottom: "0",
    right: "4rem",
    zIndex: "9999",
    width: "220px",
    height: "300px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    overflow: "hidden",
    padding: "0",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    opacity: "0",
    transform: "translateY(100%)",
    transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease",
  });

  if (!_isMobile) {
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(0) scale(1.03)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translateY(0) scale(1)";
    });
  }

  const canvasWrap = document.createElement("div");
  canvasWrap.id = "vesi-toggle-canvas";
  Object.assign(canvasWrap.style, {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  });
  btn.appendChild(canvasWrap);

  document.body.appendChild(btn);

  setTimeout(() => {
    btn.style.opacity = "1";
    btn.style.transform = _isMobile ? "scale(1)" : "translateY(0)";
  }, 800);

  return { btn, canvasWrap };
}

let _activeBubble = null;
let _bubbleTimeout = null;

function showVesiBubble(text, toggleBtn) {
  if (_activeBubble) {
    _activeBubble.style.opacity = "0";
    _activeBubble.style.transform = "translateY(8px)";
    const old = _activeBubble;
    setTimeout(() => old.remove(), 400);
  }
  clearTimeout(_bubbleTimeout);

  const bubble = document.createElement("div");
  Object.assign(bubble.style, {
    position: "fixed",
    zIndex: "9998",
    background: BG_DARK,
    border: `1px solid ${ACCENT}44`,
    borderRadius: "12px",
    padding: "14px 18px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    maxWidth: "280px",
    opacity: "0",
    transform: "translateY(8px)",
    transition: "opacity 0.4s, transform 0.4s",
    pointerEvents: "none",
    backdropFilter: "blur(8px)",
  });
  if (_isMobile) {
    bubble.style.bottom = "92px";
    bubble.style.right = "1rem";
  } else {
    bubble.style.bottom = "310px";
    bubble.style.right = "4rem";
  }
  bubble.textContent = text;

  const pointer = document.createElement("div");
  Object.assign(pointer.style, {
    position: "absolute",
    bottom: "-6px",
    width: "12px",
    height: "12px",
    background: BG_DARK,
    border: `1px solid ${ACCENT}44`,
    borderTop: "none",
    borderLeft: "none",
    transform: "rotate(45deg)",
  });
  if (_isMobile) {
    pointer.style.right = "20px";
  } else {
    pointer.style.right = "100px";
  }
  bubble.appendChild(pointer);

  document.body.appendChild(bubble);
  _activeBubble = bubble;

  requestAnimationFrame(() => {
    bubble.style.opacity = "1";
    bubble.style.transform = "translateY(0)";
  });

  toggleBtn.addEventListener(
    "click",
    () => {
      bubble.style.opacity = "0";
      clearTimeout(_bubbleTimeout);
      setTimeout(() => bubble.remove(), 400);
      if (_activeBubble === bubble) _activeBubble = null;
    },
    { once: true },
  );
}

function initRandomQuip(toggleBtn) {
  const delayMs = (3 + Math.random() * 2) * 1000;
  setTimeout(() => {
    const quip = RANDOM_QUIPS[Math.floor(Math.random() * RANDOM_QUIPS.length)];
    showVesiBubble(quip, toggleBtn);
  }, delayMs);
}

function createVesiOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "vesi-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "10000",
    background: BG_DARK,
    clipPath: _isMobile
      ? "circle(0% at calc(100% - 52px) calc(100% - 52px))"
      : "circle(0% at calc(100% - 144px) calc(100% - 150px))",
    transition: "clip-path 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Inter, sans-serif",
  });

  const grid = document.createElement("div");
  Object.assign(grid.style, {
    position: "absolute",
    inset: "0",
    backgroundImage:
      "linear-gradient(rgba(0,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.04) 1px, transparent 1px)",
    backgroundSize: "50px 50px",
    pointerEvents: "none",
  });
  overlay.appendChild(grid);

  const glow = document.createElement("div");
  Object.assign(glow.style, {
    position: "absolute",
    inset: "0",
    background:
      "radial-gradient(ellipse at 50% 70%, rgba(0,255,255,0.06) 0%, transparent 50%)",
    pointerEvents: "none",
  });
  overlay.appendChild(glow);

  const canvasWrap = document.createElement("div");
  canvasWrap.id = "vesi-overlay-canvas";
  Object.assign(canvasWrap.style, {
    position: "absolute",
    inset: "0",
  });
  overlay.appendChild(canvasWrap);

  const back = document.createElement("button");
  back.innerHTML = "&#8592; back";
  back.setAttribute("aria-label", "Close Vesi overlay");
  Object.assign(back.style, {
    position: "absolute",
    top: "1.5rem",
    left: "1.5rem",
    zIndex: "2",
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
    transition: "color 0.2s",
  });
  back.addEventListener("mouseenter", () => {
    back.style.color = ACCENT;
  });
  back.addEventListener("mouseleave", () => {
    back.style.color = "rgba(255,255,255,0.5)";
  });
  overlay.appendChild(back);

  const label = document.createElement("div");
  label.textContent = "VESI v1.0";
  Object.assign(label.style, {
    position: "absolute",
    top: "1.5rem",
    right: "1.5rem",
    zIndex: "2",
    color: `${ACCENT}66`,
    fontSize: "12px",
    fontWeight: "500",
    letterSpacing: "0.05em",
  });
  overlay.appendChild(label);

  const dialogueBox = document.createElement("div");
  Object.assign(dialogueBox.style, {
    position: "absolute",
    bottom: "2rem",
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(700px, calc(100% - 2rem))",
    zIndex: "2",
    background: "rgba(0,0,0,0.75)",
    border: `2px solid ${ACCENT}44`,
    borderRadius: "8px",
    padding: "1.5rem",
    backdropFilter: "blur(8px)",
  });

  dialogueBox.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") _skipTyping = true;
  });

  const nameTag = document.createElement("div");
  nameTag.textContent = "Vesi";
  Object.assign(nameTag.style, {
    color: ACCENT,
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "8px",
    letterSpacing: "0.02em",
  });
  dialogueBox.appendChild(nameTag);

  const textEl = document.createElement("div");
  textEl.id = "vesi-dialogue-text";
  Object.assign(textEl.style, {
    color: "rgba(255,255,255,0.85)",
    fontSize: "15px",
    lineHeight: "1.6",
    minHeight: "1.6em",
  });
  dialogueBox.appendChild(textEl);

  const choicesEl = document.createElement("div");
  choicesEl.id = "vesi-dialogue-choices";
  Object.assign(choicesEl.style, {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    marginTop: "16px",
  });
  dialogueBox.appendChild(choicesEl);

  overlay.appendChild(dialogueBox);
  document.body.appendChild(overlay);

  return { overlay, canvasWrap, back, textEl, choicesEl };
}

async function showDialogue(key, textEl, choicesEl) {
  const entry = DIALOGUE[key];
  if (!entry) return;

  choicesEl.innerHTML = "";
  choicesEl.style.opacity = "0";

  await typeText(textEl, entry.message);

  entry.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt.label;
    Object.assign(btn.style, {
      background: "none",
      border: "none",
      color: `${ACCENT}aa`,
      fontSize: "14px",
      cursor: "pointer",
      padding: "6px 0",
      textAlign: "left",
      fontFamily: "Inter, sans-serif",
      transition: "color 0.15s, padding-left 0.15s",
    });
    const originalLabel = opt.label;
    btn.addEventListener("mouseenter", () => {
      btn.style.color = ACCENT;
      btn.style.paddingLeft = "12px";
      btn.textContent = "▸ " + originalLabel;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.color = `${ACCENT}aa`;
      btn.style.paddingLeft = "0";
      btn.textContent = originalLabel;
    });
    btn.addEventListener("click", () => {
      showDialogue(opt.action, textEl, choicesEl);
    });
    choicesEl.appendChild(btn);
  });

  await delay(100);
  choicesEl.style.transition = "opacity 0.3s";
  choicesEl.style.opacity = "1";
}

async function initVRM(toggleContainer, overlayContainer) {
  try {
    const THREE = await import("three");
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");

    function createScene(w, h, cameraOpts) {
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(cameraOpts.fov, w / h, 0.1, 50);
      camera.position.set(...cameraOpts.pos);
      camera.lookAt(...cameraOpts.lookAt);

      scene.add(new THREE.AmbientLight(0xffffff, cameraOpts.ambient || 1.5));
      const dir = new THREE.DirectionalLight(0xffffff, cameraOpts.dir || 1.2);
      dir.position.set(1, 2, 3);
      scene.add(dir);

      if (cameraOpts.rim) {
        const rim = new THREE.PointLight(0x00ffff, 0.3, 10);
        rim.position.set(0, 0, 1);
        scene.add(rim);
      }

      return { renderer, scene, camera };
    }

    const tScene = _isMobile
      ? createScene(144, 144, { fov: 16, pos: [0, 1.42, 1.6], lookAt: [0, 1.38, 0], ambient: 1.4, dir: 1.0 })
      : createScene(440, 600, { fov: 24, pos: [0, 1.15, 2.8], lookAt: [0, 1.1, 0], ambient: 1.4, dir: 1.0 });
    const tCanvas = tScene.renderer.domElement;
    tCanvas.style.width = "100%";
    tCanvas.style.height = "100%";
    toggleContainer.appendChild(tCanvas);

    const oW = window.innerWidth;
    const oH = window.innerHeight;
    const oScene = createScene(oW, oH, {
      fov: 22,
      pos: [0, 1.2, 3.0],
      lookAt: [0, 1.15, 0],
      ambient: 1.0,
      dir: 1.5,
      rim: true,
    });
    const oCanvas = oScene.renderer.domElement;
    oCanvas.style.width = "100%";
    oCanvas.style.height = "100%";
    overlayContainer.appendChild(oCanvas);

    window.addEventListener("resize", () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      oScene.renderer.setSize(w, h);
      oScene.camera.aspect = w / h;
      oScene.camera.updateProjectionMatrix();
    });

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    const gltf = await loader.loadAsync("src/models/8590256991748008892.glb");
    const vrm = gltf.userData.vrm;
    VRMUtils.removeUnnecessaryJoints(vrm.scene);
    VRMUtils.removeUnnecessaryVertices(vrm.scene);
    VRMUtils.rotateVRM0(vrm);
    
    if (vesiMode === "overlay") {
      oScene.scene.add(vrm.scene);
    } else {
      tScene.scene.add(vrm.scene);
    }

    const clock = new THREE.Clock();
    let lastBlinkTime = 0;
    let blinkPhase = 0;
    let poseBlendFactor = 0;

    const IDLE_POSE = {
      leftUpperArm:  { x: 0.2,  y: 0.0,  z: 0.3  },
      leftLowerArm:  { x: -0.3, y: 0.0,  z: 0.1  },
      leftHand:      { x: 0.4,  y: 0.0,  z: 0.1  },
      rightUpperArm: { x: 0.2,  y: 0.0,  z: -0.3 },
      rightLowerArm: { x: -0.3, y: 0.0,  z: -0.1 },
      rightHand:     { x: 0.4,  y: 0.0,  z: -0.1 },
    };

    const FINGER_CURL = {
      Thumb:  { Proximal: 0.3, Distal: 0.1 },
      Index:  { Proximal: 0.8, Intermediate: 0.9, Distal: 0.7 },
      Middle: { Proximal: 0.8, Intermediate: 0.9, Distal: 0.7 },
      Ring:   { Proximal: 0.8, Intermediate: 0.9, Distal: 0.7 },
      Little: { Proximal: 0.8, Intermediate: 0.9, Distal: 0.7 },
    };

    const MOUTH_EXPRESSIONS = ["aa", "ih", "ou", "ee", "oh"];
    const EMOTION_EXPRESSIONS = ["happy", "angry", "surprised", "relaxed", "sad"];
    const MOUTH_LERP_SPEED = 12;
    const POSE_BLEND_SPEED = 2.0;

    function animate() {
      requestAnimationFrame(animate);
      if (vesiMode === "paused") return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const bobAmplitude = _talkingState.active ? 0.006 : 0.003;
      vrm.scene.position.y = Math.sin(elapsed * 1.2) * bobAmplitude;

      const headBone = vrm.humanoid?.getNormalizedBoneNode("head");
      if (headBone) {
        const headYaw = Math.sin(elapsed * 0.4) * 0.05;
        const headPitch = Math.sin(elapsed * 0.3) * 0.02;
        if (_talkingState.active) {
          headBone.rotation.y = headYaw + Math.sin(elapsed * 1.5) * 0.03;
          headBone.rotation.x = headPitch - 0.03;
          headBone.rotation.z = Math.sin(elapsed * 0.8) * 0.015;
        } else {
          headBone.rotation.y = headYaw;
          headBone.rotation.x = headPitch;
          headBone.rotation.z *= Math.max(0, 1 - 4 * delta);
        }
      }

      const spineBone = vrm.humanoid?.getNormalizedBoneNode("spine");
      if (spineBone) {
        const spineTarget = _talkingState.active ? -0.02 : 0;
        spineBone.rotation.x += (spineTarget - spineBone.rotation.x) * Math.min(1, 3 * delta);
      }

      if (vrm.expressionManager) {
        if (_talkingState.active) {
          const targetViseme = getViseme(_talkingState.currentChar);
          MOUTH_EXPRESSIONS.forEach((expr) => {
            const current = vrm.expressionManager.getValue(expr) || 0;
            const target = expr === targetViseme ? 0.6 : 0;
            vrm.expressionManager.setValue(
              expr,
              current + (target - current) * Math.min(1, MOUTH_LERP_SPEED * delta),
            );
          });
          EMOTION_EXPRESSIONS.forEach((em) => {
            const current = vrm.expressionManager.getValue(em) || 0;
            const target = em === _talkingState.emotion ? 0.25 : 0;
            vrm.expressionManager.setValue(
              em,
              current + (target - current) * Math.min(1, 4 * delta),
            );
          });
        } else {
          MOUTH_EXPRESSIONS.forEach((expr) => {
            const current = vrm.expressionManager.getValue(expr) || 0;
            if (current > 0.001)
              vrm.expressionManager.setValue(expr, current * Math.max(0, 1 - 8 * delta));
          });
          EMOTION_EXPRESSIONS.forEach((em) => {
            const current = vrm.expressionManager.getValue(em) || 0;
            if (current > 0.001)
              vrm.expressionManager.setValue(em, current * Math.max(0, 1 - 4 * delta));
          });
        }

        if (
          blinkPhase === 0 &&
          elapsed - lastBlinkTime > 3 + Math.random() * 2
        ) {
          blinkPhase = 1;
          lastBlinkTime = elapsed;
        }
        if (blinkPhase === 1) {
          const blinkT = (elapsed - lastBlinkTime) * 8;
          if (blinkT < 1) {
            vrm.expressionManager.setValue("blink", blinkT);
          } else if (blinkT < 2) {
            vrm.expressionManager.setValue("blink", 2 - blinkT);
          } else {
            vrm.expressionManager.setValue("blink", 0);
            blinkPhase = 0;
          }
        }
        vrm.expressionManager.update();
      }

      vrm.update(delta);

      poseBlendFactor = Math.min(1, poseBlendFactor + POSE_BLEND_SPEED * delta);

      for (const [boneName, targetRot] of Object.entries(IDLE_POSE)) {
        const bone = vrm.humanoid?.getNormalizedBoneNode(boneName);
        if (bone) {
          bone.rotation.x += (targetRot.x - bone.rotation.x) * poseBlendFactor;
          bone.rotation.y += (targetRot.y - bone.rotation.y) * poseBlendFactor;
          bone.rotation.z += (targetRot.z - bone.rotation.z) * poseBlendFactor;
        }
      }

      for (const [fingerName, joints] of Object.entries(FINGER_CURL)) {
        for (const side of ["left", "right"]) {
          for (const [joint, angle] of Object.entries(joints)) {
            const bone = vrm.humanoid?.getNormalizedBoneNode(`${side}${fingerName}${joint}`);
            if (bone) bone.rotation.x += (angle - bone.rotation.x) * poseBlendFactor;
          }
        }
      }

      const lArm = vrm.humanoid?.getNormalizedBoneNode("leftUpperArm");
      const rArm = vrm.humanoid?.getNormalizedBoneNode("rightUpperArm");
      const breathe = Math.sin(elapsed * 1.0) * 0.005 * poseBlendFactor;
      if (lArm) lArm.rotation.z += breathe;
      if (rArm) rArm.rotation.z -= breathe;

      if (vesiMode === "toggle") {
        tScene.renderer.render(tScene.scene, tScene.camera);
      } else if (vesiMode === "overlay") {
        oScene.renderer.render(oScene.scene, oScene.camera);
      }
    }

    animate();

    window.vesiAvatar = {
      setMode(m) {
        tScene.scene.remove(vrm.scene);
        oScene.scene.remove(vrm.scene);
        if (m === "toggle") tScene.scene.add(vrm.scene);
        if (m === "overlay") oScene.scene.add(vrm.scene);
        vesiMode = m;
      },
    };
  } catch (e) {
    console.warn("Vesi 3D failed, using fallback:", e);
    loadFallback(toggleContainer, overlayContainer);
  }
}

function loadFallback(toggleContainer, overlayContainer) {
  const img1 = document.createElement("img");
  img1.src = "src/img/Vesi.png";
  img1.alt = "Vesi";
  Object.assign(img1.style, {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "top",
  });
  toggleContainer.appendChild(img1);

  const img2 = document.createElement("img");
  img2.src = "src/img/Vesi.png";
  img2.alt = "Vesi";
  Object.assign(img2.style, {
    maxHeight: "60vh",
    objectFit: "contain",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  });
  overlayContainer.appendChild(img2);
}

document.addEventListener("DOMContentLoaded", () => {
  const { btn: toggleBtn, canvasWrap: toggleCanvas } = createVesiToggle();
  const { overlay, canvasWrap, back, textEl, choicesEl } =
    createVesiOverlay();

  initRandomQuip(toggleBtn);

  let overlayOpen = false;

  toggleBtn.addEventListener("click", () => {
    if (overlayOpen) return;
    overlayOpen = true;
    overlay.style.clipPath = _isMobile
      ? "circle(150% at calc(100% - 52px) calc(100% - 52px))"
      : "circle(150% at calc(100% - 144px) calc(100% - 150px))";
    toggleBtn.style.display = "none";
    if (_activeBubble) {
      _activeBubble.style.opacity = "0";
      setTimeout(() => { if (_activeBubble) _activeBubble.remove(); _activeBubble = null; }, 300);
    }
    vesiMode = "overlay";
    if (window.vesiAvatar) window.vesiAvatar.setMode("overlay");
    sessionStorage.setItem("vesi-interacted", "1");
    showDialogue("opening", textEl, choicesEl);
  });

  back.addEventListener("click", () => {
    overlayOpen = false;
    overlay.style.clipPath = _isMobile
      ? "circle(0% at calc(100% - 52px) calc(100% - 52px))"
      : "circle(0% at calc(100% - 144px) calc(100% - 150px))";
    toggleBtn.style.display = "flex";
    vesiMode = "toggle";
    if (window.vesiAvatar) window.vesiAvatar.setMode("toggle");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlayOpen) back.click();
  });

  initVRM(toggleCanvas, canvasWrap);
});

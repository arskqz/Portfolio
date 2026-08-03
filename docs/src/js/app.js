const DIALOGUE = { // Cool idea maybe ill come back to it
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
    border: `2px solid ${ACCENT}88`,
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
    clipPath: "circle(50%)",
  } : {
    position: "fixed",
    bottom: "0",
    right: "8rem",
    zIndex: "9999",
    width: "280px",
    height: "400px",
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
  const btnRect = toggleBtn.getBoundingClientRect();
  bubble.style.bottom = (window.innerHeight - btnRect.top + 8) + "px";
  bubble.style.right = (window.innerWidth - btnRect.right + btnRect.width / 2 - 40) + "px";
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
    right: _isMobile ? "20px" : "40px",
  });
  bubble.appendChild(pointer);

  document.body.appendChild(bubble);
  _activeBubble = bubble;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bubble.style.opacity = "1";
      bubble.style.transform = "translateY(0)";
    });
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
      : "circle(0% at calc(100% - 268px) calc(100% - 200px))",
    transition: "clip-path 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Inter, sans-serif",
  });

  const glow = document.createElement("div");
  Object.assign(glow.style, {
    position: "absolute",
    inset: "0",
    background:
      "radial-gradient(ellipse at 50% 60%, rgba(0,255,255,0.04) 0%, transparent 60%)",
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
    bottom: "1.5rem",
    left: "50%",
    transform: "translateX(-50%)",
    width: _isMobile ? "calc(100% - 2rem)" : "min(550px, 60%)",
    zIndex: "2",
    background: "rgba(0,0,0,0.8)",
    border: `1px solid ${ACCENT}33`,
    borderRadius: "8px",
    padding: _isMobile ? "1.25rem" : "1.25rem 1.5rem",
    backdropFilter: "blur(12px)",
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
      dir.position.set(2, 3, 3);
      scene.add(dir);
      const fill = new THREE.DirectionalLight(0xaaccff, 0.3);
      fill.position.set(-2, 2, 2);
      scene.add(fill);

      return { renderer, scene, camera };
    }

    const tScene = _isMobile
      ? createScene(144, 144, { fov: 16, pos: [0, 1.18, 1.6], lookAt: [0, 1.18, 0], ambient: 1.4, dir: 1.0 })
      : createScene(440, 600, { fov: 18, pos: [0.2, 1.05, 2], lookAt: [0, 1.1, 0], ambient: 1.4, dir: 1.0 });
    const tCanvas = tScene.renderer.domElement;
    tCanvas.style.width = "100%";
    tCanvas.style.height = "100%";
    toggleContainer.appendChild(tCanvas);

    const oW = window.innerWidth;
    const oH = window.innerHeight;
    const oRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    oRenderer.setSize(oW, oH);
    oRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    oRenderer.outputColorSpace = THREE.SRGBColorSpace;
    const oSceneObj = new THREE.Scene();
    const oCamera = new THREE.PerspectiveCamera(60, oW / oH, 0.1, 100);
    oCamera.position.set(0, 1.0, 0.8);
    oCamera.lookAt(0, 1.0, 0);

    oSceneObj.add(new THREE.AmbientLight(0xffffff, 0.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.2);
    keyLight.position.set(2, 3, 3);
    oSceneObj.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xaaccff, 0.2);
    fillLight.position.set(-2, 2, 2);
    oSceneObj.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffaadd, 0.15);
    rimLight.position.set(0, 2, -3);
    oSceneObj.add(rimLight);

    const oScene = { renderer: oRenderer, scene: oSceneObj, camera: oCamera };
    const oCanvas = oRenderer.domElement;
    oCanvas.style.width = "100%";
    oCanvas.style.height = "100%";
    overlayContainer.appendChild(oCanvas);

    window.addEventListener("resize", () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      oRenderer.setSize(w, h);
      oCamera.aspect = w / h;
      oCamera.updateProjectionMatrix();
    });

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    const gltf = await loader.loadAsync("src/models/Vesi_00.vrm");
    const vrm = gltf.userData.vrm;
    VRMUtils.combineSkeletons(vrm.scene);
    VRMUtils.removeUnnecessaryVertices(vrm.scene);
    VRMUtils.rotateVRM0(vrm);

    const IDLE_POSE = {
      leftUpperArm:  { x: 0.6,  y: 0.1,  z: 1.1  },
      leftLowerArm:  { x: -0.75, y: 0.0, z: 1.0  },
      leftHand:      { x: 0.0,  y: 0.0,  z: 0.2  },
      rightUpperArm: { x: 0.6,  y: -0.1, z: -1.1 },
      rightLowerArm: { x: -0.75, y: 0.0, z: -1.0 },
      rightHand:     { x: -2.0, y: 0.0,  z: -0.2 },
    };

    const WAVE_POSE = {
      rightUpperArm: { x: 0.4,  y: 0.0,  z: -0.3 },
      rightLowerArm: { x: -1.4, y: 0.0,  z: 0.0  },
      rightHand:     { x: 0.0,  y: 0.0,  z: 0.0  },
    };

    const FINGER_CURL = {
      Thumb:  { Proximal: 0.3, Distal: 0.1 },
      Index:  { Proximal: 0.8, Intermediate: 0.9, Distal: 0.7 },
      Middle: { Proximal: 0.8, Intermediate: 0.9, Distal: 0.7 },
      Ring:   { Proximal: 0.8, Intermediate: 0.9, Distal: 0.7 },
      Little: { Proximal: 0.8, Intermediate: 0.9, Distal: 0.7 },
    };

    let _animState = "idle";
    let _waveTimer = 0;

    function lerpBone(bone, target, t) {
      bone.rotation.x += (target.x - bone.rotation.x) * t;
      bone.rotation.y += (target.y - bone.rotation.y) * t;
      bone.rotation.z += (target.z - bone.rotation.z) * t;
    }

    function applyIdlePose() {
      vrm.humanoid.resetNormalizedPose();
      for (const [boneName, targetRot] of Object.entries(IDLE_POSE)) {
        const bone = vrm.humanoid?.getNormalizedBoneNode(boneName);
        if (bone) {
          bone.rotation.x = targetRot.x;
          bone.rotation.y = targetRot.y;
          bone.rotation.z = targetRot.z;
        }
      }
      for (const [fingerName, joints] of Object.entries(FINGER_CURL)) {
        for (const side of ["left", "right"]) {
          for (const [joint, angle] of Object.entries(joints)) {
            const bone = vrm.humanoid?.getNormalizedBoneNode(`${side}${fingerName}${joint}`);
            if (bone) bone.rotation.x = angle;
          }
        }
      }
    }

    function applyWave(elapsed, delta) {
      _waveTimer += delta;
      const t = Math.min(1, _waveTimer * 3);

      for (const [boneName, target] of Object.entries(WAVE_POSE)) {
        const bone = vrm.humanoid?.getNormalizedBoneNode(boneName);
        if (bone) lerpBone(bone, target, t);
      }

      const hand = vrm.humanoid?.getNormalizedBoneNode("rightHand");
      if (hand && t > 0.5) {
        hand.rotation.z = Math.sin(elapsed * 8) * 0.4;
      }

      if (_waveTimer > 2.0) {
        _animState = "idle";
        _waveTimer = 0;
      }
    }

    let _emotionBlend = 0;
    let _currentEmotionTarget = 0;

    function applyEmotionPose(emotion, delta) {
      if (emotion === "surprised") _currentEmotionTarget = 0.15;
      else if (emotion === "angry") _currentEmotionTarget = -0.18;
      else if (emotion === "happy") _currentEmotionTarget = 0.08;
      else _currentEmotionTarget = 0;

      _emotionBlend += (_currentEmotionTarget - _emotionBlend) * Math.min(1, 3 * delta);

      const spine = vrm.humanoid?.getNormalizedBoneNode("spine");
      if (spine) spine.rotation.x = _emotionBlend;

      const upperChest = vrm.humanoid?.getNormalizedBoneNode("upperChest");
      if (upperChest) upperChest.rotation.x = _emotionBlend * 0.6;

      const neck = vrm.humanoid?.getNormalizedBoneNode("neck");
      if (neck) {
        if (emotion === "surprised") neck.rotation.x = _emotionBlend * 0.3;
        else if (emotion === "angry") neck.rotation.x = _emotionBlend * -0.4;
      }
    }

    applyIdlePose();
    vrm.update(0);

    if (vesiMode === "overlay") {
      oScene.scene.add(vrm.scene);
    } else {
      tScene.scene.add(vrm.scene);
    }

    const clock = new THREE.Clock();
    let lastBlinkTime = 0;
    let blinkPhase = 0;

    const MOUTH_EXPRESSIONS = ["aa", "ih", "ou", "ee", "oh"];
    const EMOTION_EXPRESSIONS = ["happy", "angry", "surprised", "relaxed", "sad"];
    const MOUTH_LERP_SPEED = 12;

    function animate() {
      requestAnimationFrame(animate);
      if (vesiMode === "paused") return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // 1. Reset + idle pose (base layer)
      applyIdlePose();

      // 2. Head animation (on top of idle)
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
        }
      }

      // 3. Spine lean when talking (toggle side only)
      if (_talkingState.active && vesiMode === "toggle") {
        const spineBone = vrm.humanoid?.getNormalizedBoneNode("spine");
        if (spineBone) spineBone.rotation.x = -0.02;
      }

      // 4. Overlay animations
      if (_animState === "wave") {
        applyWave(elapsed, delta);
      }
      if (vesiMode === "overlay") {
        applyEmotionPose(_talkingState.active ? _talkingState.emotion : "relaxed", delta);
      }

      // 5. Expressions (face)
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
            const target = em === _talkingState.emotion ? 0.5 : 0;
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

      // 6. Breathing (additive)
      const lArm = vrm.humanoid?.getNormalizedBoneNode("leftUpperArm");
      const rArm = vrm.humanoid?.getNormalizedBoneNode("rightUpperArm");
      const breathe = Math.sin(elapsed * 1.0) * 0.005;
      if (lArm) lArm.rotation.z += breathe;
      if (rArm) rArm.rotation.z -= breathe;

      // 7. Bob
      const bobAmplitude = _talkingState.active ? 0.006 : 0.003;
      vrm.scene.position.y = Math.sin(elapsed * 1.2) * bobAmplitude;

      // 8. Sync normalized → raw, then render
      vrm.update(delta);

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
      wave() {
        _animState = "wave";
        _waveTimer = 0;
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
      : "circle(150% at calc(100% - 268px) calc(100% - 200px))";
    toggleBtn.style.display = "none";
    if (_activeBubble) {
      _activeBubble.style.opacity = "0";
      setTimeout(() => { if (_activeBubble) _activeBubble.remove(); _activeBubble = null; }, 300);
    }
    vesiMode = "overlay";
    if (window.vesiAvatar) {
      window.vesiAvatar.setMode("overlay");
      window.vesiAvatar.wave();
    }
    sessionStorage.setItem("vesi-interacted", "1");
    showDialogue("opening", textEl, choicesEl);
  });

  back.addEventListener("click", () => {
    overlayOpen = false;
    overlay.style.clipPath = _isMobile
      ? "circle(0% at calc(100% - 52px) calc(100% - 52px))"
      : "circle(0% at calc(100% - 268px) calc(100% - 200px))";
    toggleBtn.style.display = "flex";
    vesiMode = "toggle";
    if (window.vesiAvatar) window.vesiAvatar.setMode("toggle");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlayOpen) back.click();
  });

  initVRM(toggleCanvas, canvasWrap);
});

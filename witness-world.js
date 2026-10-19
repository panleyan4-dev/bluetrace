(() => {
  "use strict";

  const root = document.querySelector("[data-witness]");
  const viewport = root?.querySelector("[data-witness-viewport]");
  const canvas = root?.querySelector("[data-witness-canvas]");
  const fallback = root?.querySelector("[data-witness-fallback]");

  if (!root || !viewport || !canvas || !window.THREE) {
    root?.classList.add("witness--fallback");
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const mobileViewport = window.matchMedia("(max-width: 720px)");
  const clamp = THREE.MathUtils.clamp;
  const lerp = THREE.MathUtils.lerp;
  const smoothstep = (start, end, value) => {
    const normalized = clamp((value - start) / Math.max(end - start, 0.0001), 0, 1);
    return normalized * normalized * (3 - (2 * normalized));
  };

  const createRng = (seed) => {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  };

  const state = {
    targetProgress: 0,
    progress: 0,
    lastProgress: 0,
    pointerTarget: new THREE.Vector2(),
    pointer: new THREE.Vector2(),
    pointerActive: false,
    inView: true,
    running: true,
    disposed: false,
    lastTime: performance.now(),
  };
  const qaProgress = Number(new URLSearchParams(window.location.search).get("witnessProgress"));
  const hasQaProgress = Number.isFinite(qaProgress) && qaProgress >= 0 && qaProgress <= 1;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !mobileViewport.matches,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileViewport.matches ? 1.3 : 1.7));
  renderer.setSize(viewport.clientWidth, viewport.clientHeight, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = false;

  const clearWater = new THREE.Color(0x0b6793);
  const deepWater = new THREE.Color(0x143f6f);
  const murkyWater = new THREE.Color(0x477b7c);
  const scene = new THREE.Scene();
  scene.background = clearWater.clone();
  scene.fog = new THREE.FogExp2(clearWater.clone(), 0.00425);
  renderer.setClearColor(clearWater, 1);

  const camera = new THREE.PerspectiveCamera(
    mobileViewport.matches ? 59 : 50,
    viewport.clientWidth / Math.max(viewport.clientHeight, 1),
    0.1,
    420,
  );
  scene.add(camera);

  const world = new THREE.Group();
  world.name = "Continuous polluted reef-to-open-water world";
  scene.add(world);

  const loader = new THREE.TextureLoader();
  const resolveAsset = (path) => window.BLUETRACE_INLINE_ASSETS?.[path] || path;
  const ownedTextures = [];
  const ownedMaterials = [];
  const loadTexture = (path, onLoad) => {
    loader.load(
      resolveAsset(path),
      (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        ownedTextures.push(texture);
        onLoad(texture);
      },
      undefined,
      () => root.classList.add("witness--asset-warning"),
    );
  };

  const hemi = new THREE.HemisphereLight(0xa9e4ef, 0x173e55, 1.34);
  scene.add(hemi);
  const keyLight = new THREE.DirectionalLight(0xe0fafb, 1.86);
  keyLight.position.set(-14, 34, 18);
  scene.add(keyLight);
  scene.add(keyLight.target);
  const coolFill = new THREE.AmbientLight(0x3c7791, 0.34);
  scene.add(coolFill);

  const oceanUniforms = {
    time: { value: 0 },
    murk: { value: 0 },
  };
  const oceanMaterial = new THREE.ShaderMaterial({
    uniforms: oceanUniforms,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vDirection;
      void main() {
        vUv = uv;
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float murk;
      varying vec2 vUv;
      varying vec3 vDirection;
      void main() {
        vec3 clearTop = vec3(0.12, 0.61, 0.76);
        vec3 clearMid = vec3(0.035, 0.31, 0.51);
        vec3 clearDeep = vec3(0.025, 0.13, 0.34);
        vec3 murkyTop = vec3(0.28, 0.53, 0.52);
        vec3 murkyDeep = vec3(0.12, 0.28, 0.34);
        float heightMix = smoothstep(0.2, 0.88, vUv.y);
        vec3 clearColor = mix(clearDeep, clearMid, smoothstep(0.0, 0.62, vUv.y));
        clearColor = mix(clearColor, clearTop, smoothstep(0.68, 1.0, vUv.y));
        vec3 murkyColor = mix(murkyDeep, murkyTop, heightMix);
        float surfaceBands = sin((vUv.x * 34.0) + (time * 0.055))
          * sin((vUv.y * 23.0) - (time * 0.043));
        float surfaceLight = smoothstep(0.82, 1.0, vUv.y)
          * (0.025 + (surfaceBands * 0.012));
        float horizonGlow = exp(-pow((vUv.y - 0.64) * 4.2, 2.0)) * 0.055;
        vec3 color = mix(clearColor, murkyColor, murk * 0.72);
        color += vec3(0.36, 0.68, 0.76) * (surfaceLight + horizonGlow);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
  ownedMaterials.push(oceanMaterial);
  const oceanShell = new THREE.Mesh(
    new THREE.SphereGeometry(136, mobileViewport.matches ? 28 : 40, mobileViewport.matches ? 18 : 26),
    oceanMaterial,
  );
  oceanShell.name = "Infinite open-water volume";
  scene.add(oceanShell);

  const siltPlumes = [];
  const siltMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      opacity: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float opacity;
      varying vec2 vUv;
      void main() {
        float horizontal = 1.0 - smoothstep(0.0, 0.56, abs(vUv.x - 0.5));
        float vertical = smoothstep(0.0, 0.22, vUv.y) * (1.0 - smoothstep(0.64, 1.0, vUv.y));
        float grain = sin((vUv.x * 34.0) + time * 0.12) * sin((vUv.y * 21.0) - time * 0.09);
        float alpha = horizontal * vertical * opacity * (0.78 + grain * 0.12);
        gl_FragColor = vec4(0.52, 0.56, 0.48, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  ownedMaterials.push(siltMaterial);
  [
    { x: -11, y: -4.8, z: -146, scale: [13, 4.8], phase: 0.2 },
    { x: 8, y: -5.4, z: -312, scale: [18, 5.2], phase: 1.6 },
    { x: -5, y: -4.9, z: -520, scale: [21, 6.4], phase: 3.1 },
  ].forEach((definition) => {
    const plume = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), siltMaterial);
    plume.position.set(definition.x, definition.y, definition.z);
    plume.scale.set(definition.scale[0], definition.scale[1], 1);
    plume.userData.definition = definition;
    plume.renderOrder = 3;
    world.add(plume);
    siltPlumes.push(plume);
  });

  const murkVeilMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      opacity: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float opacity;
      varying vec2 vUv;
      void main() {
        float bands = sin((vUv.x * 8.0) + time * 0.08)
          + sin((vUv.y * 11.0) - time * 0.06)
          + sin(((vUv.x + vUv.y) * 6.0) + time * 0.04);
        float center = smoothstep(0.92, 0.12, distance(vUv, vec2(0.5, 0.52)));
        float lowCloud = smoothstep(0.25, 0.78, 1.0 - vUv.y);
        float alpha = opacity * (0.32 + bands * 0.045 + center * 0.22 + lowCloud * 0.18);
        gl_FragColor = vec4(0.37, 0.48, 0.42, clamp(alpha, 0.0, 0.78));
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
  });
  ownedMaterials.push(murkVeilMaterial);
  const murkVeil = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), murkVeilMaterial);
  murkVeil.name = "Dynamic final turbidity veil";
  murkVeil.renderOrder = 24;
  scene.add(murkVeil);

  const lightShafts = [];
  [
    { x: -18, width: 13, height: 78, opacity: 0.078, phase: 0.4 },
    { x: -4, width: 18, height: 88, opacity: 0.062, phase: 1.8 },
    { x: 12, width: 14, height: 74, opacity: 0.07, phase: 3.2 },
    { x: 25, width: 10, height: 66, opacity: 0.052, phase: 4.7 },
  ].forEach((definition, index) => {
    const material = new THREE.ShaderMaterial({
      uniforms: { opacity: { value: definition.opacity } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float opacity;
        varying vec2 vUv;
        void main() {
          float horizontal = 1.0 - smoothstep(0.0, 0.5, abs(vUv.x - 0.5));
          float vertical = smoothstep(0.0, 0.2, vUv.y)
            * (1.0 - smoothstep(0.66, 1.0, vUv.y));
          float alpha = horizontal * horizontal * vertical * opacity;
          gl_FragColor = vec4(0.58, 0.9, 0.96, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    ownedMaterials.push(material);
    const shaft = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    shaft.scale.set(definition.width, definition.height, 1);
    shaft.userData.definition = definition;
    shaft.renderOrder = 2 + index;
    scene.add(shaft);
    lightShafts.push(shaft);
  });

  const depthBackdrops = [];
  const makeDepthBackdrop = (path, width, height, position, options = {}) => {
    const geometry = new THREE.PlaneGeometry(width, height, options.segments || 20, options.rows || 10);
    const mesh = new THREE.Mesh(geometry);
    mesh.name = options.name || `Depth backdrop ${path}`;
    mesh.position.copy(position);
    mesh.rotation.set(
      THREE.MathUtils.degToRad(options.rotationX || 0),
      THREE.MathUtils.degToRad(options.rotationY || 0),
      THREE.MathUtils.degToRad(options.rotationZ || 0),
    );
    mesh.renderOrder = options.renderOrder || 1;
    mesh.userData.basePosition = position.clone();
    mesh.userData.baseRotation = mesh.rotation.clone();
    mesh.userData.baseVertices = new Float32Array(geometry.attributes.position.array);
    mesh.userData.phase = options.phase || 0;
    mesh.userData.opacity = options.opacity || 0.45;
    mesh.userData.appearStart = options.appearStart || 0;
    mesh.userData.appearEnd = options.appearEnd || 0.12;
    mesh.userData.leaveStart = options.leaveStart || 0.82;
    mesh.userData.leaveEnd = options.leaveEnd || 1;
    mesh.userData.drift = options.drift || 0.7;
    mesh.visible = false;
    world.add(mesh);
    loadTexture(path, (texture) => {
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        fog: true,
        color: options.tint || 0xdaf4f2,
      });
      ownedMaterials.push(material);
      mesh.material = material;
      mesh.userData.ready = true;
    });
    depthBackdrops.push(mesh);
    return mesh;
  };

  makeDepthBackdrop(
    "assets/first-act/witness-environment-matte-v20.jpg",
    176,
    98.7,
    new THREE.Vector3(1.5, 5.8, -230),
    {
      name: "Bleached-coral seafloor volume, approached after the opening",
      opacity: 0.92,
      phase: 0.35,
      rotationX: -0.8,
      rotationY: -1.8,
      appearStart: 0.095,
      appearEnd: 0.17,
      leaveStart: 0.4,
      leaveEnd: 0.58,
      renderOrder: 1,
      tint: 0xe0f3f0,
      drift: 0.48,
    },
  );
  makeDepthBackdrop(
    "assets/first-act/witness-bright-debris-water-v1.jpg",
    192,
    107,
    new THREE.Vector3(3.5, 9.5, -314),
    {
      name: "Clear-to-debris water volume, fixed in the forward path",
      opacity: 0.48,
      phase: 0.9,
      rotationX: -1.4,
      rotationY: -3.2,
      appearStart: 0.24,
      appearEnd: 0.38,
      leaveStart: 0.55,
      leaveEnd: 0.72,
      renderOrder: 1,
      tint: 0xdbf5f7,
    },
  );
  makeDepthBackdrop(
    "assets/first-act/witness-forward-open-water-v1.jpg",
    205,
    114,
    new THREE.Vector3(-4.5, 13.2, -535),
    {
      name: "Open-water plastic field, beyond the seafloor",
      opacity: 0.44,
      phase: 2.4,
      rotationX: 1.1,
      rotationY: 3.8,
      appearStart: 0.42,
      appearEnd: 0.56,
      leaveStart: 0.72,
      leaveEnd: 0.9,
      renderOrder: 1,
      tint: 0xd4eef2,
    },
  );
  makeDepthBackdrop(
    "assets/first-act/witness-final-murky-debris-v1.jpg",
    222,
    139,
    new THREE.Vector3(1.5, 20.8, -820),
    {
      name: "Final murky water wall, approached by scroll",
      opacity: 0.58,
      phase: 4.8,
      rotationX: 0.8,
      rotationY: -2.4,
      appearStart: 0.62,
      appearEnd: 0.78,
      leaveStart: 1.05,
      leaveEnd: 1.2,
      renderOrder: 1,
      tint: 0xd5e8df,
      drift: 1.05,
    },
  );

  const particleCount = mobileViewport.matches ? 1250 : 2150;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSeeds = new Float32Array(particleCount);
  const particleScales = new Float32Array(particleCount);
  const particleRng = createRng(7701);
  for (let index = 0; index < particleCount; index += 1) {
    particlePositions[(index * 3)] = (particleRng() - 0.5) * 92;
    particlePositions[(index * 3) + 1] = -24 + (particleRng() * 62);
    particlePositions[(index * 3) + 2] = 35 - (particleRng() * 900);
    particleSeeds[index] = particleRng();
    particleScales[index] = 0.65 + (particleRng() * 1.35);
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute("seed", new THREE.BufferAttribute(particleSeeds, 1));
  particleGeometry.setAttribute("pointScale", new THREE.BufferAttribute(particleScales, 1));
  const particleUniforms = {
    time: { value: 0 },
    murk: { value: 0 },
    reduced: { value: reducedMotion.matches ? 1 : 0 },
  };
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: `
      uniform float time;
      uniform float murk;
      uniform float reduced;
      attribute float seed;
      attribute float pointScale;
      varying float vAlpha;
      void main() {
        vec3 animated = position;
        float motion = 1.0 - reduced;
        float phase = (seed * 31.0) + (time * (0.11 + (seed * 0.13)));
        animated.x += sin(phase * 0.7) * 0.32 * motion;
        animated.y += sin(phase) * 0.22 * motion;
        animated.z += cos(phase * 0.53) * 0.26 * motion;
        vec4 mvPosition = modelViewMatrix * vec4(animated, 1.0);
        float perspective = clamp(120.0 / max(-mvPosition.z, 1.0), 0.42, 3.2);
        gl_PointSize = pointScale * mix(1.0, 3.15, murk) * perspective;
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = mix(0.12, 0.72, murk) * clamp(perspective, 0.5, 1.4);
      }
    `,
    fragmentShader: `
      uniform float murk;
      varying float vAlpha;
      void main() {
        vec2 centered = gl_PointCoord - vec2(0.5);
        float distanceFromCenter = length(centered);
        float alpha = (1.0 - smoothstep(0.25, 0.5, distanceFromCenter)) * vAlpha;
        vec3 color = mix(vec3(0.68, 0.86, 0.88), vec3(0.72, 0.69, 0.54), murk);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  ownedMaterials.push(particleMaterial);
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.frustumCulled = false;
  particles.name = "Suspended open-water particles";
  world.add(particles);

  const fish = [];
  const fishGroupCenters = [
    new THREE.Vector3(-10, 5.5, -96),
    new THREE.Vector3(9, 4.2, -225),
    new THREE.Vector3(-7, 8.5, -385),
    new THREE.Vector3(12, 12.5, -575),
    new THREE.Vector3(-12, 16.5, -720),
  ];
  const fishCounts = mobileViewport.matches ? [8, 8, 10, 11, 8] : [18, 18, 22, 26, 18];
  const fishRng = createRng(328);
  fishGroupCenters.forEach((center, schoolIndex) => {
    for (let index = 0; index < fishCounts[schoolIndex]; index += 1) {
      const group = new THREE.Group();
      const home = center.clone().add(new THREE.Vector3(
        (fishRng() - 0.5) * (schoolIndex === 0 ? 24 : 18),
        (fishRng() - 0.5) * 9,
        (fishRng() - 0.5) * 18,
      ));
      group.position.copy(home);
      world.add(group);
      fish.push({
        group,
        home,
        schoolIndex,
        phase: fishRng() * Math.PI * 2,
        speed: 0.18 + (fishRng() * 0.2),
        scale: 0.46 + (fishRng() * 0.76),
        response: new THREE.Vector3(),
        sprite: null,
      });
    }
  });
  loadTexture("assets/first-act/fish-realistic-single-v2.png", (texture) => {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      alphaTest: 0.065,
      side: THREE.DoubleSide,
      fog: true,
      color: 0xd6e7e8,
    });
    ownedMaterials.push(material);
    const geometry = new THREE.PlaneGeometry(1.45, 0.67);
    fish.forEach((item, index) => {
      const sprite = new THREE.Mesh(geometry, material);
      sprite.scale.setScalar(item.scale);
      sprite.scale.x *= index % 5 === 0 ? -1 : 1;
      sprite.renderOrder = 4;
      item.group.add(sprite);
      item.sprite = sprite;
    });
  });

  const driftingProps = [];
  const makeDriftingProp = (path, width, height, position, options = {}) => {
    const group = new THREE.Group();
    group.position.copy(position);
    group.userData.basePosition = position.clone();
    group.userData.kind = options.kind || "debris";
    group.userData.phase = options.phase || 0;
    group.userData.baseOpacity = options.opacity || 0.9;
    group.userData.staticAnchor = Boolean(options.staticAnchor);
    group.userData.appearStart = options.appearStart ?? 0;
    group.userData.appearEnd = options.appearEnd ?? 0.08;
    group.userData.leaveStart = options.leaveStart ?? 0.36;
    group.userData.leaveEnd = options.leaveEnd ?? 0.72;
    group.userData.visibleStart = options.visibleStart ?? 125;
    group.userData.visibleEnd = options.visibleEnd ?? 188;
    group.userData.facingStrength = options.facingStrength ?? 0.68;
    group.userData.baseRotation = new THREE.Euler(
      THREE.MathUtils.degToRad(options.rotationX || 0),
      THREE.MathUtils.degToRad(options.rotationY || 0),
      THREE.MathUtils.degToRad(options.rotationZ || 0),
    );
    group.userData.ready = false;
    group.userData.response = new THREE.Vector3();
    group.rotation.copy(group.userData.baseRotation);
    world.add(group);
    loadTexture(path, (texture) => {
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: group.userData.baseOpacity,
        alphaTest: options.alphaTest || 0.035,
        depthWrite: options.depthWrite || false,
        side: THREE.DoubleSide,
        fog: true,
        color: options.tint || 0xe4eeee,
        roughness: 0.8,
        metalness: 0,
        emissive: 0x203c40,
        emissiveMap: texture,
        emissiveIntensity: options.emissiveIntensity ?? 0.2,
      });
      ownedMaterials.push(material);
      const geometry = new THREE.PlaneGeometry(
        width,
        height,
        options.segments || 1,
        options.segments || 1,
      );
      const mesh = new THREE.Mesh(geometry, material);
      mesh.renderOrder = options.renderOrder || 6;
      group.add(mesh);
      group.userData.mesh = mesh;
      group.userData.baseVertices = new Float32Array(geometry.attributes.position.array);
      group.userData.ready = true;
    });
    driftingProps.push(group);
    return group;
  };

  makeDriftingProp(
    "assets/first-act/rocks-far-web-v1.png",
    48,
    31.24,
    new THREE.Vector3(-11.5, -11.8, -108),
    {
      kind: "reefBed",
      phase: 0.2,
      opacity: 0.7,
      staticAnchor: true,
      depthWrite: true,
      renderOrder: 2,
      tint: 0xd5e4e0,
      emissiveIntensity: 0.04,
      appearStart: 0.035,
      appearEnd: 0.12,
      leaveStart: 0.28,
      leaveEnd: 0.48,
      visibleStart: 150,
      visibleEnd: 226,
      facingStrength: 0.08,
      rotationX: -11,
      rotationY: 10,
      rotationZ: -2,
    },
  );
  makeDriftingProp(
    "assets/first-act/rocks-near-web-v1.png",
    58,
    37.76,
    new THREE.Vector3(3.8, -12.8, -150),
    {
      kind: "reefBed",
      phase: 0.42,
      opacity: 0.82,
      staticAnchor: true,
      depthWrite: true,
      renderOrder: 2,
      tint: 0xd8e7e2,
      emissiveIntensity: 0.035,
      appearStart: 0.045,
      appearEnd: 0.14,
      leaveStart: 0.31,
      leaveEnd: 0.52,
      visibleStart: 166,
      visibleEnd: 244,
      facingStrength: 0.06,
      rotationX: -12,
      rotationY: -6,
      rotationZ: 1,
    },
  );
  makeDriftingProp(
    "assets/first-act/coral-sparse-web-v1.png",
    34,
    17,
    new THREE.Vector3(13.2, -11.6, -132),
    {
      kind: "reefBed",
      phase: 0.55,
      opacity: 0.5,
      staticAnchor: true,
      depthWrite: true,
      renderOrder: 3,
      tint: 0xdcebe8,
      emissiveIntensity: 0.04,
      appearStart: 0.055,
      appearEnd: 0.14,
      leaveStart: 0.31,
      leaveEnd: 0.5,
      visibleStart: 144,
      visibleEnd: 216,
      facingStrength: 0.08,
      rotationX: -10,
      rotationY: -8,
      rotationZ: 2,
    },
  );
  makeDriftingProp(
    "assets/first-act/bleached-coral-web-v1.png",
    26.5,
    17.66,
    new THREE.Vector3(4.4, -10.8, -152),
    {
      kind: "reef",
      phase: 0.7,
      opacity: 0.96,
      staticAnchor: true,
      depthWrite: true,
      renderOrder: 3,
      tint: 0xf4f7f4,
      emissiveIntensity: 0.08,
      appearStart: 0.04,
      appearEnd: 0.14,
      leaveStart: 0.3,
      leaveEnd: 0.5,
      visibleStart: 170,
      visibleEnd: 250,
      facingStrength: 0.1,
      rotationX: -10,
      rotationY: -5,
      rotationZ: 0.5,
    },
  );
  makeDriftingProp(
    "assets/images/witness-plastic-bag-overlay-v1.png",
    9.5,
    9.5,
    new THREE.Vector3(-12.5, 8.8, -290),
    {
      kind: "bag",
      phase: 1.45,
      opacity: 0.78,
      segments: 8,
      renderOrder: 7,
      appearStart: 0.26,
      appearEnd: 0.38,
      visibleStart: 132,
      visibleEnd: 205,
      facingStrength: 0.72,
      rotationY: 6,
    },
  );
  makeDriftingProp(
    "assets/images/witness-plastic-bottle-overlay-v1.png",
    6.8,
    4.53,
    new THREE.Vector3(13.5, 11.8, -408),
    {
      kind: "bottle",
      phase: 3.9,
      opacity: 0.82,
      renderOrder: 6,
      appearStart: 0.36,
      appearEnd: 0.49,
      visibleStart: 132,
      visibleEnd: 205,
      facingStrength: 0.62,
      rotationY: -8,
      rotationZ: -17,
    },
  );
  makeDriftingProp(
    "assets/images/witness-plastic-bag-overlay-v1.png",
    7.2,
    7.2,
    new THREE.Vector3(17.5, 15.6, -495),
    {
      kind: "bag",
      phase: 2.8,
      opacity: 0.54,
      segments: 8,
      renderOrder: 7,
      appearStart: 0.44,
      appearEnd: 0.56,
      visibleStart: 130,
      visibleEnd: 210,
      facingStrength: 0.58,
      rotationY: -14,
    },
  );
  makeDriftingProp(
    "assets/images/witness-plastic-bottle-overlay-v1.png",
    7.8,
    5.2,
    new THREE.Vector3(-16.5, 14.2, -520),
    {
      kind: "bottle",
      phase: 4.8,
      opacity: 0.58,
      renderOrder: 6,
      appearStart: 0.46,
      appearEnd: 0.58,
      visibleStart: 132,
      visibleEnd: 214,
      facingStrength: 0.54,
      rotationY: 11,
      rotationZ: 12,
    },
  );
  makeDriftingProp(
    "assets/first-act/sea-turtle.png",
    15.8,
    9.63,
    new THREE.Vector3(9.8, 13.2, -608),
    {
      kind: "turtle",
      phase: 4.3,
      opacity: 0.98,
      alphaTest: 0.025,
      depthWrite: true,
      segments: 8,
      renderOrder: 7,
      tint: 0xffffff,
      appearStart: 0.5,
      appearEnd: 0.64,
      visibleStart: 142,
      visibleEnd: 220,
      facingStrength: 0.62,
      rotationX: 2,
      rotationY: -10,
    },
  );
  makeDriftingProp(
    "assets/images/witness-plastic-fragments-overlay-v1.png",
    19.4,
    10.36,
    new THREE.Vector3(-4.8, 19.2, -755),
    {
      kind: "fragments",
      phase: 5.2,
      opacity: 0.52,
      renderOrder: 6,
      tint: 0xc9e5e7,
      emissiveIntensity: 0.1,
      appearStart: 0.66,
      appearEnd: 0.82,
      visibleStart: 162,
      visibleEnd: 250,
      facingStrength: 0.42,
      rotationY: 8,
    },
  );


  const cameraCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 4.6, 16),
      new THREE.Vector3(-0.8, 4.4, -38),
      new THREE.Vector3(1.2, 2.8, -102),
      new THREE.Vector3(4.2, 1.7, -138),
      new THREE.Vector3(-4.4, 6.8, -250),
      new THREE.Vector3(4.8, 9.6, -384),
      new THREE.Vector3(8.2, 12.8, -548),
      new THREE.Vector3(2.6, 16.8, -676),
      new THREE.Vector3(-1.2, 21.4, -865),
    ],
    false,
    "catmullrom",
    0.42,
  );
  const targetCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 3.5, -26),
      new THREE.Vector3(1.2, -4.6, -116),
      new THREE.Vector3(4.4, -9.6, -210),
      new THREE.Vector3(3.2, -9.8, -235),
      new THREE.Vector3(-10.8, 7.6, -294),
      new THREE.Vector3(12.4, 11.8, -420),
      new THREE.Vector3(9.8, 13.2, -610),
      new THREE.Vector3(2.8, 19.2, -760),
      new THREE.Vector3(0, 25.4, -940),
    ],
    false,
    "catmullrom",
    0.42,
  );
  const cameraPoint = new THREE.Vector3();
  const targetPoint = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const pointerWorld = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const workingColor = new THREE.Color();
  const orientationHelper = new THREE.Object3D();

  const readProgress = () => {
    if (hasQaProgress) {
      state.targetProgress = qaProgress;
      return state.targetProgress;
    }
    const rect = root.getBoundingClientRect();
    const travel = Math.max(root.offsetHeight - window.innerHeight, 1);
    state.targetProgress = clamp(-rect.top / travel, 0, 1);
    return state.targetProgress;
  };

  const updateCameraAndWater = (time, delta) => {
    readProgress();
    const follow = reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 4.7);
    state.progress = lerp(state.progress, state.targetProgress, follow);
    state.pointer.lerp(
      state.pointerTarget,
      reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 5.2),
    );

    const progress = state.progress;
    const motion = reducedMotion.matches ? 0 : 1;
    cameraCurve.getPointAt(progress, cameraPoint);
    targetCurve.getPointAt(progress, targetPoint);
    cameraCurve.getTangentAt(progress, tangent);
    camera.position.set(
      cameraPoint.x + (Math.sin(time * 0.11) * 0.12 * motion) + (state.pointer.x * 0.75),
      cameraPoint.y + (Math.sin((time * 0.085) + 0.8) * 0.08 * motion) - (state.pointer.y * 0.38),
      cameraPoint.z,
    );
    lookTarget.set(
      targetPoint.x + (state.pointer.x * 2.8),
      targetPoint.y - (state.pointer.y * 1.45),
      targetPoint.z,
    );
    camera.lookAt(lookTarget);
    const progressVelocity = progress - state.lastProgress;
    state.lastProgress = progress;
    if (!reducedMotion.matches) {
      camera.rotateZ(
        clamp(progressVelocity * -0.95, -0.012, 0.012)
          + clamp(-tangent.x * 0.026, -0.018, 0.018)
          + (state.pointer.x * 0.005),
      );
    }

    const murk = smoothstep(0.58, 0.99, progress) * 0.94;
    oceanUniforms.time.value = time;
    oceanUniforms.murk.value = murk;
    particleUniforms.time.value = time;
    particleUniforms.murk.value = murk;
    particleUniforms.reduced.value = reducedMotion.matches ? 1 : 0;
    oceanShell.position.copy(camera.position);
    scene.fog.color.copy(clearWater).lerp(murkyWater, murk * 0.52);
    scene.fog.density = lerp(0.00425, 0.0135, murk);
    workingColor.copy(clearWater).lerp(deepWater, smoothstep(0.18, 0.74, progress) * 0.28);
    workingColor.lerp(murkyWater, murk * 0.34);
    scene.background.copy(workingColor);
    renderer.setClearColor(workingColor, 1);
    hemi.intensity = lerp(1.34, 1.16, murk);
    keyLight.intensity = lerp(1.86, 1.54, murk)
      * (1 + (Math.sin(time * 0.41) * 0.028 * motion));
    keyLight.position.set(-14, 34, camera.position.z + 14);
    keyLight.target.position.set(0, 0, camera.position.z - 34);
    keyLight.target.updateMatrixWorld();

    lightShafts.forEach((shaft, index) => {
      const definition = shaft.userData.definition;
      shaft.position.set(
        definition.x + (Math.sin((time * 0.075) + definition.phase) * 2.2 * motion),
        camera.position.y + 22 + (Math.sin((time * 0.055) + definition.phase) * 1.4 * motion),
        camera.position.z - 35 - (index * 9),
      );
      shaft.lookAt(camera.position);
      shaft.rotateZ((definition.x * -0.003) + (Math.sin((time * 0.05) + definition.phase) * 0.018 * motion));
      shaft.material.uniforms.opacity.value = definition.opacity * lerp(1, 0.42, murk);
    });

    const baseFov = mobileViewport.matches ? 59 : 50;
    const coralFocus = smoothstep(0.12, 0.2, progress) * (1 - smoothstep(0.34, 0.48, progress));
    const debrisFocus = smoothstep(0.36, 0.48, progress) * (1 - smoothstep(0.58, 0.7, progress));
    const turtleFocus = smoothstep(0.52, 0.62, progress) * (1 - smoothstep(0.7, 0.82, progress));
    const desiredFov = baseFov - (Math.max(coralFocus, debrisFocus * 0.65, turtleFocus) * (mobileViewport.matches ? 1.5 : 2.8));
    if (Math.abs(camera.fov - desiredFov) > 0.02) {
      camera.fov = desiredFov;
      camera.updateProjectionMatrix();
    }

    const seabedTransition = smoothstep(0.42, 0.72, progress);
    siltMaterial.uniforms.time.value = time;
    siltMaterial.uniforms.opacity.value = 0.28 * smoothstep(0.18, 0.46, progress) * (1 - smoothstep(0.72, 0.9, progress));
    siltPlumes.forEach((plume) => {
      const definition = plume.userData.definition;
      plume.position.x = definition.x + (Math.sin((time * 0.06) + definition.phase) * 1.3 * motion);
      plume.position.y = definition.y - (seabedTransition * 3.8);
      plume.position.z = definition.z + (Math.cos((time * 0.045) + definition.phase) * 1.8 * motion);
      plume.lookAt(camera.position);
      plume.rotateZ(Math.sin((time * 0.04) + definition.phase) * 0.012 * motion);
      const distanceFromCamera = plume.position.distanceTo(camera.position);
      plume.visible = distanceFromCamera < 150 && siltMaterial.uniforms.opacity.value > 0.01;
    });

    const veilDistance = 42;
    const veilHeight = 2 * veilDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5);
    const veilWidth = veilHeight * camera.aspect;
    const veilOpacity = smoothstep(0.68, 0.98, progress) * 0.62;
    murkVeil.scale.set(veilWidth * 1.12, veilHeight * 1.12, 1);
    murkVeil.position.set(camera.position.x, camera.position.y, camera.position.z - veilDistance);
    murkVeil.lookAt(camera.position.x, camera.position.y, camera.position.z);
    murkVeilMaterial.uniforms.time.value = time;
    murkVeilMaterial.uniforms.opacity.value = veilOpacity;
    murkVeil.visible = veilOpacity > 0.004;

    viewport.style.setProperty(
      "--witness-prompt-opacity",
      (1 - smoothstep(0.006, 0.035, progress)).toFixed(3),
    );
    viewport.style.setProperty(
      "--witness-cover-opacity",
      (1 - smoothstep(0.02, 0.13, progress)).toFixed(3),
    );
    viewport.style.setProperty("--witness-murk", murk.toFixed(3));
    viewport.style.setProperty("--witness-bg-scale", (1.02 + (progress * 0.04)).toFixed(3));
    viewport.style.setProperty("--witness-bg-x", `${(-progress * 5).toFixed(2)}%`);
    viewport.style.setProperty("--witness-bg-y", `${(progress * -2).toFixed(2)}%`);

    pointerWorld.set(
      camera.position.x + (state.pointer.x * 10),
      camera.position.y - (state.pointer.y * 6),
      camera.position.z - 22,
    );
  };

  const updateDepthBackdrops = (time) => {
    const motion = reducedMotion.matches ? 0 : 1;
    depthBackdrops.forEach((mesh) => {
      if (!mesh.userData.ready) return;
      const base = mesh.userData.basePosition;
      const progressVisibility = smoothstep(mesh.userData.appearStart, mesh.userData.appearEnd, state.progress)
        * (1 - smoothstep(mesh.userData.leaveStart, mesh.userData.leaveEnd, state.progress));
      const signedDepth = camera.position.z - base.z;
      const inFront = smoothstep(-18, 34, signedDepth);
      const rangeVisibility = 1 - smoothstep(238, 330, Math.abs(signedDepth));
      const opacity = mesh.userData.opacity * progressVisibility * inFront * rangeVisibility;
      mesh.visible = opacity > 0.004;
      if (!mesh.visible) {
        mesh.material.opacity = 0;
        return;
      }

      mesh.material.opacity = opacity;
      mesh.position.set(
        base.x + (Math.sin((time * 0.028) + mesh.userData.phase) * mesh.userData.drift * motion),
        base.y + (Math.sin((time * 0.023) + mesh.userData.phase) * mesh.userData.drift * 0.34 * motion),
        base.z,
      );
      mesh.rotation.copy(mesh.userData.baseRotation);
      mesh.rotation.z += Math.sin((time * 0.018) + mesh.userData.phase) * 0.006 * motion;

      if (!reducedMotion.matches && mesh.userData.baseVertices) {
        const positions = mesh.geometry.attributes.position;
        const baseVertices = mesh.userData.baseVertices;
        const waveStrength = 1.5 + (mesh.userData.drift * 0.7);
        for (let index = 0; index < positions.count; index += 1) {
          const offset = index * 3;
          const x = baseVertices[offset];
          const y = baseVertices[offset + 1];
          const wave = Math.sin((x * 0.035) + (y * 0.045) + (time * 0.16) + mesh.userData.phase)
            + Math.sin((x * -0.026) + (time * 0.11));
          positions.setZ(index, baseVertices[offset + 2] + (wave * waveStrength * opacity));
        }
        positions.needsUpdate = true;
      }
    });
  };

  const updateFish = (time, delta) => {
    const motion = reducedMotion.matches ? 0 : 1;
    fish.forEach((item, index) => {
      const schoolSweep = Math.sin(
        (time * (0.1 + (item.schoolIndex * 0.018)))
          + (item.schoolIndex * 1.7),
      );
      const target = item.home.clone();
      target.x += (schoolSweep * (5.2 + (item.schoolIndex * 1.4)))
        + (Math.sin((time * item.speed) + item.phase) * 1.4 * motion);
      target.y += Math.sin((time * item.speed * 1.45) + item.phase) * 0.48 * motion;
      target.z += Math.cos((time * item.speed * 0.72) + item.phase) * 1.1 * motion;

      item.group.getWorldPosition(projected);
      projected.project(camera);
      const dx = projected.x - state.pointer.x;
      const dy = projected.y - state.pointer.y;
      const screenDistance = Math.hypot(dx, dy);
      const depthDistance = Math.abs(item.group.position.z - pointerWorld.z);
      const influence = state.pointerActive && screenDistance < 0.42
        ? (1 - (screenDistance / 0.42)) * clamp(1 - (depthDistance / 34), 0, 1)
        : 0;
      if (influence > 0 && !reducedMotion.matches) {
        const divisor = Math.max(screenDistance, 0.04);
        item.response.x += (dx / divisor) * influence * 0.38;
        item.response.y += (dy / divisor) * influence * 0.23;
        item.response.z += influence * 0.16;
      }
      item.response.multiplyScalar(Math.pow(0.9, delta * 60));
      target.add(item.response);
      const previousX = item.group.position.x;
      item.group.position.lerp(target, 1 - Math.exp(-delta * (1.45 + (influence * 4))));
      item.group.lookAt(camera.position);
      if (item.sprite) {
        const direction = item.group.position.x - previousX;
        const flip = direction > 0 ? -1 : 1;
        item.sprite.scale.x = Math.abs(item.scale) * flip;
        item.sprite.scale.y = item.scale * (1 + (Math.sin((time * 3.1) + item.phase) * 0.018 * motion));
        item.sprite.rotation.z = Math.sin((time * 0.6) + item.phase) * 0.035 * motion;
      }
    });
  };

  const updateProps = (time, delta) => {
    const motion = reducedMotion.matches ? 0 : 1;
    driftingProps.forEach((group) => {
      if (!group.userData.ready) return;
      const base = group.userData.basePosition;
      const phase = group.userData.phase;
      const kind = group.userData.kind;
      group.position.copy(base);
      group.rotation.copy(group.userData.baseRotation);
      orientationHelper.position.copy(group.position);
      orientationHelper.lookAt(camera.position);
      group.quaternion.slerp(orientationHelper.quaternion, group.userData.facingStrength);
      const distanceFromCamera = group.position.distanceTo(camera.position);
      const signedDepth = camera.position.z - group.position.z;
      const inFrontVisibility = smoothstep(-10, 24, signedDepth);
      const distanceVisibility = (1 - smoothstep(
        group.userData.visibleStart,
        group.userData.visibleEnd,
        distanceFromCamera,
      )) * inFrontVisibility;
      const appearVisibility = smoothstep(
        group.userData.appearStart,
        group.userData.appearEnd,
        state.progress,
      );
      const scrollVisibility = (kind === "reef" || kind === "reefBed")
        ? 1 - smoothstep(group.userData.leaveStart, group.userData.leaveEnd, state.progress)
        : 1;
      const mesh = group.userData.mesh;
      if (mesh) {
        mesh.material.opacity = group.userData.baseOpacity * distanceVisibility * scrollVisibility * appearVisibility;
      }
      group.visible = (distanceVisibility * scrollVisibility * appearVisibility) > 0.002;
      if (!group.visible) return;

      if (kind === "reef" || kind === "reefBed") {
        group.position.x += Math.sin((time * 0.035) + phase) * 0.08 * motion;
        group.position.y -= smoothstep(group.userData.leaveStart, group.userData.leaveEnd, state.progress) * (kind === "reef" ? 0.9 : 1.8);
        group.rotateZ(Math.sin((time * 0.028) + phase) * 0.004 * motion);
      } else if (kind === "turtle") {
        group.getWorldPosition(projected);
        projected.project(camera);
        const dx = projected.x - state.pointer.x;
        const dy = projected.y - state.pointer.y;
        const distance = Math.hypot(dx, dy);
        const depthDistance = Math.abs(group.position.z - pointerWorld.z);
        const influence = state.pointerActive && distance < 0.56
          ? (1 - (distance / 0.56)) * clamp(1 - (depthDistance / 38), 0, 1)
          : 0;
        const desired = new THREE.Vector3();
        if (influence > 0 && !reducedMotion.matches) {
          const divisor = Math.max(distance, 0.05);
          desired.set((dx / divisor) * 3.6, (dy / divisor) * 2.2, -1.4).multiplyScalar(influence);
        }
        group.userData.response.lerp(desired, 1 - Math.exp(-delta * 2.6));
        group.position.add(group.userData.response);
        group.position.x += Math.sin((time * 0.29) + phase) * 1.15 * motion;
        group.position.y += Math.sin((time * 0.61) + phase) * 0.34 * motion;
        group.position.z += Math.cos((time * 0.22) + phase) * 0.54 * motion;
        group.rotateZ((Math.sin((time * 0.57) + phase) * 0.035 * motion) - (group.userData.response.y * 0.055));
      } else if (kind === "bag") {
        group.position.x += Math.sin((time * 0.42) + phase) * 0.38 * motion;
        group.position.y += Math.sin((time * 0.67) + phase) * 0.28 * motion;
        group.position.z += Math.cos((time * 0.27) + phase) * 0.22 * motion;
        const billow = Math.sin((time * 0.76) + phase) * 0.045 * motion;
        group.scale.set(1 + billow, 1 - (billow * 0.72), 1);
        group.rotateZ(Math.sin((time * 0.39) + phase) * 0.052 * motion);
      } else if (kind === "bottle") {
        group.position.x += Math.sin((time * 0.3) + phase) * 0.16 * motion;
        group.position.y += Math.sin((time * 0.47) + phase) * 0.14 * motion;
        group.rotateZ(-0.3 + (Math.sin((time * 0.34) + phase) * 0.045 * motion));
      } else if (kind === "school") {
        group.position.x += Math.sin((time * 0.11) + phase) * 1.3 * motion;
        group.position.y += Math.sin((time * 0.08) + phase) * 0.36 * motion;
        group.position.z += Math.cos((time * 0.07) + phase) * 0.5 * motion;
        group.rotateZ(Math.sin((time * 0.05) + phase) * 0.015 * motion);
      } else {
        group.position.x += Math.sin((time * 0.24) + phase) * 0.24 * motion;
        group.position.y += Math.sin((time * 0.36) + phase) * 0.18 * motion;
        group.rotateZ(-0.08 + (Math.sin((time * 0.2) + phase) * 0.024 * motion));
      }

      const baseVertices = group.userData.baseVertices;
      if (
        mesh
        && baseVertices
        && !reducedMotion.matches
        && (kind === "bag" || kind === "turtle")
      ) {
        const positions = mesh.geometry.attributes.position;
        for (let index = 0; index < positions.count; index += 1) {
          const offset = index * 3;
          const localX = baseVertices[offset];
          const localY = baseVertices[offset + 1];
          const amplitude = kind === "bag" ? 0.22 : 0.1;
          positions.setZ(
            index,
            baseVertices[offset + 2]
              + (Math.sin((time * (kind === "bag" ? 1.35 : 1.7)) + phase + (localX * 0.52) + (localY * 0.39)) * amplitude),
          );
        }
        positions.needsUpdate = true;
      }
    });
  };

  const render = (now) => {
    if (state.disposed) return;
    const delta = Math.min((now - state.lastTime) / 1000, 0.05);
    state.lastTime = now;
    if (state.running) {
      const time = now / 1000;
      updateCameraAndWater(time, delta);
      updateDepthBackdrops(time);
      updateFish(time, delta);
      updateProps(time, delta);
      renderer.render(scene, camera);
      root.classList.add("witness--ready");
      fallback?.setAttribute("aria-hidden", "true");
    }
    requestAnimationFrame(render);
  };

  const handlePointerMove = (event) => {
    if (reducedMotion.matches || !finePointer.matches) return;
    const rect = viewport.getBoundingClientRect();
    state.pointerTarget.set(
      clamp((((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2) - 1, -1, 1),
      clamp(-((((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2) - 1), -1, 1),
    );
    state.pointerActive = true;
  };
  const handlePointerLeave = () => {
    state.pointerTarget.set(0, 0);
    state.pointerActive = false;
  };
  const handleResize = () => {
    const width = Math.max(viewport.clientWidth, 1);
    const height = Math.max(viewport.clientHeight, 1);
    camera.aspect = width / height;
    camera.fov = mobileViewport.matches ? 59 : 50;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileViewport.matches ? 1.3 : 1.7));
    renderer.setSize(width, height, false);
  };
  const handleVisibility = () => {
    state.running = !document.hidden && state.inView;
    state.lastTime = performance.now();
  };
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      state.inView = Boolean(entry?.isIntersecting);
      state.running = !document.hidden && state.inView;
      state.lastTime = performance.now();
    },
    { threshold: 0 },
  );

  const destroy = () => {
    if (state.disposed) return;
    state.disposed = true;
    viewport.removeEventListener("pointermove", handlePointerMove);
    viewport.removeEventListener("pointerleave", handlePointerLeave);
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibility);
    visibilityObserver.disconnect();
    scene.traverse((object) => {
      object.geometry?.dispose?.();
    });
    ownedMaterials.forEach((material) => material.dispose?.());
    ownedTextures.forEach((texture) => texture.dispose?.());
    renderer.dispose();
  };

  viewport.addEventListener("pointermove", handlePointerMove, { passive: true });
  viewport.addEventListener("pointerleave", handlePointerLeave, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("pagehide", destroy, { once: true });
  visibilityObserver.observe(root);

  readProgress();
  state.progress = state.targetProgress;
  updateCameraAndWater(performance.now() / 1000, 1);
  requestAnimationFrame(render);
})();

/* Union Jack — cinematic English country-lane drive (Three.js r128).
   Progressive: painted fallback shows first; this replaces it when WebGL is ready. */
(function () {
  'use strict';
  var canvas = document.getElementById('drive');
  if (!window.THREE || !canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.innerWidth < 700 || reduced;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !mobile,
      alpha: false,
      powerPreference: 'high-performance'
    });
  } catch (e) { return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
  if (THREE.ACESFilmicToneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  }

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xD4A574);
  scene.fog = new THREE.FogExp2(0xD4A574, 0.00155);

  /* --- sky dome with soft clouds --- */
  (function sky() {
    var c = document.createElement('canvas');
    c.width = 16; c.height = 512;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0.00, '#07101F');
    g.addColorStop(0.28, '#1A2B52');
    g.addColorStop(0.52, '#4A5A7A');
    g.addColorStop(0.72, '#A8886A');
    g.addColorStop(0.88, '#D4A574');
    g.addColorStop(1.00, '#E8C89A');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 512);
    /* soft cloud bands */
    ctx.globalAlpha = 0.18;
    for (var i = 0; i < 9; i++) {
      var y = 90 + i * 28 + (i % 3) * 8;
      ctx.fillStyle = i % 2 ? '#F2E8D8' : '#C9D0DE';
      ctx.beginPath();
      ctx.ellipse(8, y, 10, 6 + (i % 3), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    var tex = new THREE.CanvasTexture(c);
    var dome = new THREE.Mesh(
      new THREE.SphereGeometry(1100, 32, 20),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false })
    );
    scene.add(dome);
  })();

  /* sun disc for depth cue */
  (function sunDisc() {
    var c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,236,190,1)');
    g.addColorStop(0.35, 'rgba(255,200,120,.55)');
    g.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    var mat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
      opacity: 0.9
    });
    var spr = new THREE.Sprite(mat);
    spr.scale.set(120, 120, 1);
    spr.position.set(-70, 48, -320);
    scene.add(spr);
  })();

  var camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.4, 1600);
  camera.position.set(0, 2.05, 0);
  var baseFov = 58;

  scene.add(new THREE.HemisphereLight(0xC5D6EE, 0x3A4A2E, 0.88));
  var sun = new THREE.DirectionalLight(0xFFE2B8, 1.35);
  sun.position.set(-55, 32, -160);
  scene.add(sun);
  var fill = new THREE.DirectionalLight(0x8AA4C8, 0.28);
  fill.position.set(40, 12, 60);
  scene.add(fill);

  /* --- lane math --- */
  var SEG = 420;
  var HALFW = 3.05;
  var AMP = 28;

  function laneX(z) { return Math.sin(z / SEG * Math.PI * 2) * AMP; }
  function laneSlope(z) { return Math.cos(z / SEG * Math.PI * 2) * AMP * (Math.PI * 2 / SEG); }
  function laneY(z) { return Math.sin(z / SEG * Math.PI * 4) * 1.55; }

  function asphaltTex() {
    var c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#2E3136'; ctx.fillRect(0, 0, 128, 128);
    for (var i = 0; i < 900; i++) {
      var v = 30 + (i * 17) % 40;
      ctx.fillStyle = 'rgba(' + v + ',' + v + ',' + (v + 4) + ',' + (0.08 + (i % 5) * 0.02) + ')';
      ctx.fillRect((i * 13) % 128, (i * 29) % 128, 1 + (i % 3), 1);
    }
    /* wheel tracks */
    ctx.fillStyle = 'rgba(18,18,20,.35)';
    ctx.fillRect(40, 0, 6, 128);
    ctx.fillRect(82, 0, 6, 128);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 40);
    return t;
  }

  function buildRibbon(width, colour, yLift, map) {
    var steps = mobile ? 160 : 280, pos = [], uvs = [], idx = [];
    for (var i = 0; i <= steps; i++) {
      var z = -SEG * (i / steps);
      var x = laneX(z), y = laneY(z) + yLift;
      var nx = 1, nz = -laneSlope(z);
      var len = Math.hypot(nx, nz); nx /= len; nz /= len;
      pos.push(x - nx * width, y, z - nz * width);
      pos.push(x + nx * width, y, z + nz * width);
      var v = i / steps * 12;
      uvs.push(0, v, 1, v);
    }
    for (var s = 0; s < steps; s++) {
      var a = s * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, c, b, b, c, d);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    var mat = map
      ? new THREE.MeshLambertMaterial({ map: map, color: 0xffffff })
      : new THREE.MeshLambertMaterial({ color: colour });
    return new THREE.Mesh(g, mat);
  }

  var roadMap = asphaltTex();
  var roadGroup = new THREE.Group(), grassGroup = new THREE.Group(), edgeGroup = new THREE.Group();
  for (var k = 0; k < 3; k++) {
    var r = buildRibbon(HALFW, 0x35383C, 0.03, roadMap); r.position.z = -SEG * k; roadGroup.add(r);
    var v = buildRibbon(85, 0x4A5C36, -0.08); v.position.z = -SEG * k; grassGroup.add(v);
    var eg = buildRibbon(HALFW + 0.42, 0x242628, 0.008); eg.position.z = -SEG * k; edgeGroup.add(eg);
  }
  scene.add(grassGroup); scene.add(edgeGroup); scene.add(roadGroup);

  function scatter(geo, mat, count, place) {
    var mesh = new THREE.InstancedMesh(geo, mat, count);
    var m = new THREE.Matrix4(), q = new THREE.Quaternion(),
        p = new THREE.Vector3(), s = new THREE.Vector3();
    for (var i = 0; i < count; i++) {
      q.identity();
      s.set(1, 1, 1);
      place(i, p, s, q);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
    return mesh;
  }

  var world = new THREE.Group();
  scene.add(world);

  var HEDGE_N = mobile ? 120 : 200;
  world.add(scatter(
    new THREE.SphereGeometry(1, 6, 5),
    new THREE.MeshLambertMaterial({ color: 0x2A4222 }),
    HEDGE_N,
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / HEDGE_N) * SEG * 2;
      var off = HALFW + 1.1 + Math.random() * 0.55;
      p.set(laneX(z) + side * off, laneY(z) + 0.95 + Math.random() * 0.55, z);
      s.set(1.45 + Math.random(), 1.55 + Math.random() * 1.15, 1.45 + Math.random());
    }));

  /* denser second hedge row for tunnel feel */
  world.add(scatter(
    new THREE.SphereGeometry(0.85, 5, 4),
    new THREE.MeshLambertMaterial({ color: 0x3A5530 }),
    Math.floor(HEDGE_N * 0.7),
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / (HEDGE_N * 0.7)) * SEG * 2 - 1.2;
      p.set(laneX(z) + side * (HALFW + 2.1 + Math.random()), laneY(z) + 0.7, z);
      s.set(1.1 + Math.random() * 0.6, 1 + Math.random() * 0.8, 1.1 + Math.random() * 0.6);
    }));

  var TREE_N = mobile ? 40 : 64;
  world.add(scatter(
    new THREE.CylinderGeometry(0.2, 0.36, 7.2, 5),
    new THREE.MeshLambertMaterial({ color: 0x4A3828 }),
    TREE_N,
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / TREE_N) * SEG * 2 - Math.random() * 7;
      p.set(laneX(z) + side * (HALFW + 3.6 + Math.random() * 4), laneY(z) + 3.5, z);
      s.set(1, 1 + Math.random() * 0.25, 1);
    }));
  world.add(scatter(
    new THREE.SphereGeometry(3.7, 7, 6),
    new THREE.MeshLambertMaterial({ color: 0x2E4A26 }),
    TREE_N,
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / TREE_N) * SEG * 2 - Math.random() * 7;
      p.set(laneX(z) + side * (HALFW + 3.4 + Math.random() * 4), laneY(z) + 7.8 + Math.random() * 1.8, z);
      var sc = 0.8 + Math.random() * 0.85; s.set(sc, sc * 0.82, sc);
    }));
  /* autumn oak accents */
  world.add(scatter(
    new THREE.SphereGeometry(3.2, 6, 5),
    new THREE.MeshLambertMaterial({ color: 0x6B5A28 }),
    Math.floor(TREE_N * 0.35),
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / (TREE_N * 0.35)) * SEG * 2 - 9;
      p.set(laneX(z) + side * (HALFW + 5 + Math.random() * 5), laneY(z) + 7.2, z);
      var sc = 0.7 + Math.random() * 0.5; s.set(sc, sc * 0.9, sc);
    }));

  var POST_N = mobile ? 90 : 140;
  world.add(scatter(
    new THREE.BoxGeometry(0.12, 1.2, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x6A5840 }),
    POST_N,
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / POST_N) * SEG * 2;
      p.set(laneX(z) + side * (HALFW + 0.72), laneY(z) + 0.58, z);
      s.set(1, 1, 1);
    }));

  /* dry-stone wall segments */
  world.add(scatter(
    new THREE.BoxGeometry(1.8, 0.85, 0.55),
    new THREE.MeshLambertMaterial({ color: 0x8A8578 }),
    mobile ? 36 : 56,
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / 56) * SEG * 2 - 3;
      p.set(laneX(z) + side * (HALFW + 1.85), laneY(z) + 0.35, z);
      s.set(0.9 + Math.random() * 0.4, 0.75 + Math.random() * 0.5, 0.9);
    }));

  /* distant hills + one church silhouette */
  world.add(scatter(
    new THREE.ConeGeometry(95, 36, 7),
    new THREE.MeshLambertMaterial({ color: 0x556655 }),
    16,
    function (i, p, s) {
      var z = -90 - i * 85;
      p.set((i % 2 ? 1 : -1) * (120 + Math.random() * 140), -5, z);
      var sc = 0.65 + Math.random() * 1; s.set(sc, sc, sc);
    }));

  (function church() {
    var g = new THREE.Group();
    var stone = new THREE.MeshLambertMaterial({ color: 0x9A9588 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 22), stone);
    body.position.y = 5;
    var tower = new THREE.Mesh(new THREE.BoxGeometry(6, 18, 6), stone);
    tower.position.set(0, 9, -8);
    var spire = new THREE.Mesh(new THREE.ConeGeometry(4.2, 10, 4), new THREE.MeshLambertMaterial({ color: 0x4A4038 }));
    spire.position.set(0, 22, -8);
    g.add(body); g.add(tower); g.add(spire);
    g.position.set(AMP + 95, laneY(-220), -220);
    world.add(g);
  })();

  /* floating dust / pollen — movie atmosphere */
  var DUST_N = mobile ? 80 : 160;
  var dustGeo = new THREE.BufferGeometry();
  var dustPos = new Float32Array(DUST_N * 3);
  for (var d = 0; d < DUST_N; d++) {
    dustPos[d * 3] = (Math.random() - 0.5) * 18;
    dustPos[d * 3 + 1] = 0.6 + Math.random() * 4;
    dustPos[d * 3 + 2] = -Math.random() * 80;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  var dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xF2E6C8,
      size: mobile ? 0.08 : 0.11,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(dust);

  /* --- cinematic motion state --- */
  var travelled = 0;
  var speed = 0;
  var target = 22;
  var intro = 0; /* 0→1 opening ramp */
  var pointer = 0, pointerT = 0;
  var lookY = 0, lookYT = 0;
  var clock = new THREE.Clock();
  var ready = false;

  /* mark canvas live for CSS fade-in */
  requestAnimationFrame(function () {
    canvas.classList.add('is-live');
    var fb = document.querySelector('.hero-fallback');
    if (fb) fb.classList.add('is-hidden');
    document.documentElement.classList.add('drive-live');
    ready = true;
  });

  window.addEventListener('pointermove', function (ev) {
    pointerT = (ev.clientX / window.innerWidth - 0.5) * 2;
    lookYT = (ev.clientY / window.innerHeight - 0.45) * -0.12;
  }, { passive: true });

  window.addEventListener('scroll', function () {
    var sc = window.scrollY || 0;
    target = 22 + Math.min(sc / 35, 32);
    /* ease hero out as you leave the drive */
    var hero = document.querySelector('.hero');
    if (hero) {
      var fade = Math.max(0, 1 - sc / (window.innerHeight * 0.85));
      canvas.style.opacity = String(0.35 + fade * 0.65);
    }
  }, { passive: true });

  var raf = 0;

  function frame() {
    raf = 0;
    if (reduced) {
      renderer.render(scene, camera);
      return;
    }
    if (document.hidden) return;

    var dt = Math.min(clock.getDelta(), 0.05);
    intro = Math.min(1, intro + dt * 0.35);
    var introEase = intro * intro * (3 - 2 * intro); /* smoothstep */

    /* movie open: slow roll then settle into cruise */
    var cruise = 18 + introEase * 8;
    var want = Math.max(target, cruise);
    if (intro < 1) want = 6 + introEase * 16;
    speed += (want - speed) * dt * 1.6;
    travelled += speed * dt;

    roadGroup.position.z = travelled % SEG;
    edgeGroup.position.z = travelled % SEG;
    grassGroup.position.z = travelled % SEG;
    world.position.z = travelled % (SEG * 2);
    roadMap.offset.y = -(travelled * 0.04) % 1;

    var zl = -(travelled % SEG);
    camera.position.x = laneX(zl);
    camera.position.y = laneY(zl) + 2.02 + Math.sin(travelled * 0.55) * 0.025;

    pointer += (pointerT - pointer) * dt * 2.6;
    lookY += (lookYT - lookY) * dt * 2.2;
    var yaw = Math.atan(laneSlope(zl)) + pointer * 0.2;
    var pitch = lookY + Math.sin(travelled * 0.08) * 0.008;
    camera.rotation.set(pitch, yaw, -pointer * 0.04 + Math.sin(travelled * 0.06) * 0.008, 'YXZ');

    /* subtle FOV breathe — cinematic presence */
    camera.fov = baseFov + Math.sin(travelled * 0.03) * 0.6 + (1 - introEase) * 6;
    camera.updateProjectionMatrix();

    /* dust drifts toward camera */
    var arr = dust.geometry.attributes.position.array;
    for (var i = 0; i < DUST_N; i++) {
      arr[i * 3 + 2] += speed * dt * 0.85;
      arr[i * 3 + 1] += Math.sin(travelled * 0.2 + i) * 0.002;
      if (arr[i * 3 + 2] > 4) {
        arr[i * 3] = (Math.random() - 0.5) * 16;
        arr[i * 3 + 1] = 0.5 + Math.random() * 4;
        arr[i * 3 + 2] = -60 - Math.random() * 40;
      }
    }
    dust.geometry.attributes.position.needsUpdate = true;
    dust.position.x = camera.position.x;
    dust.position.y = 0;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reduced) { frame(); return; }
    if (!raf) raf = requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else {
      clock.getDelta();
      start();
    }
  });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  });

  start();
})();

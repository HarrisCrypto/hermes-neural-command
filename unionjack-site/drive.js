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

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : 1.85));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
  if (THREE.ACESFilmicToneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
  }

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xC9925A);
  scene.fog = new THREE.FogExp2(0xC9925A, 0.00135);

  /* --- golden-hour sky --- */
  (function sky() {
    var c = document.createElement('canvas');
    c.width = 24; c.height = 512;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0.00, '#060D1A');
    g.addColorStop(0.22, '#1A2748');
    g.addColorStop(0.45, '#5A4A5A');
    g.addColorStop(0.62, '#C4783A');
    g.addColorStop(0.78, '#E0A056');
    g.addColorStop(0.92, '#D4A06A');
    g.addColorStop(1.00, '#C9925A');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 24, 512);
    ctx.globalAlpha = 0.22;
    for (var i = 0; i < 11; i++) {
      var y = 70 + i * 26 + (i % 3) * 6;
      ctx.fillStyle = i % 2 ? '#F6E8D2' : '#B8C0D4';
      ctx.beginPath();
      ctx.ellipse(12, y, 14, 5 + (i % 4), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    var dome = new THREE.Mesh(
      new THREE.SphereGeometry(1200, 36, 22),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(c),
        side: THREE.BackSide,
        fog: false,
        depthWrite: false
      })
    );
    scene.add(dome);
  })();

  /* sun bloom */
  (function sunDisc() {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(128, 128, 6, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,245,210,1)');
    g.addColorStop(0.2, 'rgba(255,200,110,.7)');
    g.addColorStop(0.55, 'rgba(255,140,60,.2)');
    g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    var spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
      opacity: 1
    }));
    spr.scale.set(160, 160, 1);
    spr.position.set(-90, 42, -280);
    scene.add(spr);
  })();

  var camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.35, 1800);
  camera.position.set(0, 2.05, 0);
  var baseFov = 56;

  scene.add(new THREE.HemisphereLight(0xE8D0B0, 0x2E3A28, 0.75));
  var sun = new THREE.DirectionalLight(0xFFC478, 1.55);
  sun.position.set(-70, 28, -140);
  scene.add(sun);
  var fill = new THREE.DirectionalLight(0x6A88B8, 0.22);
  fill.position.set(50, 10, 40);
  scene.add(fill);

  /* headlight pools on the tarmac */
  var headL = new THREE.SpotLight(0xFFE8C0, 1.4, 55, 0.42, 0.55, 1.2);
  headL.position.set(-0.7, 1.1, 0.2);
  headL.target.position.set(-1.2, 0, -18);
  scene.add(headL); scene.add(headL.target);
  var headR = new THREE.SpotLight(0xFFE8C0, 1.4, 55, 0.42, 0.55, 1.2);
  headR.position.set(0.7, 1.1, 0.2);
  headR.target.position.set(1.2, 0, -18);
  scene.add(headR); scene.add(headR.target);

  var SEG = 420;
  var HALFW = 3.05;
  var AMP = 30;

  function laneX(z) { return Math.sin(z / SEG * Math.PI * 2) * AMP; }
  function laneSlope(z) { return Math.cos(z / SEG * Math.PI * 2) * AMP * (Math.PI * 2 / SEG); }
  function laneY(z) { return Math.sin(z / SEG * Math.PI * 4) * 1.65; }

  function asphaltTex() {
    var c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#2A2D32'; ctx.fillRect(0, 0, 128, 128);
    for (var i = 0; i < 1100; i++) {
      var v = 28 + (i * 19) % 45;
      ctx.fillStyle = 'rgba(' + v + ',' + v + ',' + (v + 5) + ',' + (0.07 + (i % 5) * 0.02) + ')';
      ctx.fillRect((i * 13) % 128, (i * 29) % 128, 1 + (i % 3), 1);
    }
    ctx.fillStyle = 'rgba(14,14,16,.4)';
    ctx.fillRect(38, 0, 7, 128);
    ctx.fillRect(84, 0, 7, 128);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 48);
    return t;
  }

  function buildRibbon(width, colour, yLift, map) {
    var steps = mobile ? 170 : 300, pos = [], uvs = [], idx = [];
    for (var i = 0; i <= steps; i++) {
      var z = -SEG * (i / steps);
      var x = laneX(z), y = laneY(z) + yLift;
      var nx = 1, nz = -laneSlope(z);
      var len = Math.hypot(nx, nz); nx /= len; nz /= len;
      pos.push(x - nx * width, y, z - nz * width);
      pos.push(x + nx * width, y, z + nz * width);
      var v = i / steps * 14;
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
    var v = buildRibbon(95, 0x455632, -0.09); v.position.z = -SEG * k; grassGroup.add(v);
    var eg = buildRibbon(HALFW + 0.45, 0x1E2022, 0.008); eg.position.z = -SEG * k; edgeGroup.add(eg);
  }
  scene.add(grassGroup); scene.add(edgeGroup); scene.add(roadGroup);

  function scatter(geo, mat, count, place) {
    var mesh = new THREE.InstancedMesh(geo, mat, count);
    var m = new THREE.Matrix4(), q = new THREE.Quaternion(),
        p = new THREE.Vector3(), s = new THREE.Vector3();
    for (var i = 0; i < count; i++) {
      q.identity(); s.set(1, 1, 1);
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

  var HEDGE_N = mobile ? 140 : 220;
  world.add(scatter(
    new THREE.SphereGeometry(1, 6, 5),
    new THREE.MeshLambertMaterial({ color: 0x243A1E }),
    HEDGE_N,
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / HEDGE_N) * SEG * 2;
      p.set(laneX(z) + side * (HALFW + 1.05 + Math.random() * 0.5), laneY(z) + 0.95 + Math.random() * 0.55, z);
      s.set(1.5 + Math.random(), 1.6 + Math.random() * 1.2, 1.5 + Math.random());
    }));
  world.add(scatter(
    new THREE.SphereGeometry(0.9, 5, 4),
    new THREE.MeshLambertMaterial({ color: 0x355028 }),
    Math.floor(HEDGE_N * 0.75),
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / (HEDGE_N * 0.75)) * SEG * 2 - 1.1;
      p.set(laneX(z) + side * (HALFW + 2.0 + Math.random()), laneY(z) + 0.72, z);
      s.set(1.15 + Math.random() * 0.7, 1.05 + Math.random() * 0.9, 1.15 + Math.random() * 0.7);
    }));

  var TREE_N = mobile ? 44 : 72;
  world.add(scatter(
    new THREE.CylinderGeometry(0.2, 0.38, 7.4, 5),
    new THREE.MeshLambertMaterial({ color: 0x453528 }),
    TREE_N,
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / TREE_N) * SEG * 2 - Math.random() * 8;
      p.set(laneX(z) + side * (HALFW + 3.7 + Math.random() * 4.5), laneY(z) + 3.6, z);
      s.set(1, 1 + Math.random() * 0.3, 1);
    }));
  world.add(scatter(
    new THREE.SphereGeometry(3.8, 7, 6),
    new THREE.MeshLambertMaterial({ color: 0x2A4522 }),
    TREE_N,
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / TREE_N) * SEG * 2 - Math.random() * 8;
      p.set(laneX(z) + side * (HALFW + 3.5 + Math.random() * 4.5), laneY(z) + 8 + Math.random() * 1.8, z);
      var sc = 0.82 + Math.random() * 0.9; s.set(sc, sc * 0.82, sc);
    }));
  world.add(scatter(
    new THREE.SphereGeometry(3.3, 6, 5),
    new THREE.MeshLambertMaterial({ color: 0x7A5A24 }),
    Math.floor(TREE_N * 0.4),
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / (TREE_N * 0.4)) * SEG * 2 - 10;
      p.set(laneX(z) + side * (HALFW + 5.2 + Math.random() * 5), laneY(z) + 7.4, z);
      var sc = 0.7 + Math.random() * 0.55; s.set(sc, sc * 0.9, sc);
    }));

  var POST_N = mobile ? 100 : 150;
  world.add(scatter(
    new THREE.BoxGeometry(0.12, 1.25, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x6A5840 }),
    POST_N,
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / POST_N) * SEG * 2;
      p.set(laneX(z) + side * (HALFW + 0.7), laneY(z) + 0.6, z);
    }));

  world.add(scatter(
    new THREE.BoxGeometry(1.9, 0.9, 0.55),
    new THREE.MeshLambertMaterial({ color: 0x8C877A }),
    mobile ? 40 : 60,
    function (i, p, s) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / 60) * SEG * 2 - 3;
      p.set(laneX(z) + side * (HALFW + 1.9), laneY(z) + 0.38, z);
      s.set(0.9 + Math.random() * 0.45, 0.75 + Math.random() * 0.55, 0.9);
    }));

  world.add(scatter(
    new THREE.ConeGeometry(100, 38, 7),
    new THREE.MeshLambertMaterial({ color: 0x4E5E4E }),
    18,
    function (i, p, s) {
      var z = -80 - i * 80;
      p.set((i % 2 ? 1 : -1) * (125 + Math.random() * 150), -6, z);
      var sc = 0.65 + Math.random() * 1.05; s.set(sc, sc, sc);
    }));

  (function church() {
    var g = new THREE.Group();
    var stone = new THREE.MeshLambertMaterial({ color: 0x9A9588 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 22), stone); body.position.y = 5;
    var tower = new THREE.Mesh(new THREE.BoxGeometry(6, 18, 6), stone); tower.position.set(0, 9, -8);
    var spire = new THREE.Mesh(new THREE.ConeGeometry(4.2, 11, 4), new THREE.MeshLambertMaterial({ color: 0x4A4038 }));
    spire.position.set(0, 23, -8);
    g.add(body); g.add(tower); g.add(spire);
    g.position.set(AMP + 100, laneY(-240), -240);
    world.add(g);
  })();

  /* birds — small chevrons in the distance */
  var BIRD_N = mobile ? 8 : 14;
  var birds = scatter(
    new THREE.ConeGeometry(0.35, 0.12, 3),
    new THREE.MeshBasicMaterial({ color: 0x1A1A22 }),
    BIRD_N,
    function (i, p, s) {
      p.set((Math.random() - 0.5) * 80, 18 + Math.random() * 16, -40 - Math.random() * 200);
      s.set(1.2, 1, 2.5);
    });
  world.add(birds);

  /* dust / pollen */
  var DUST_N = mobile ? 100 : 200;
  var dustGeo = new THREE.BufferGeometry();
  var dustPos = new Float32Array(DUST_N * 3);
  for (var d = 0; d < DUST_N; d++) {
    dustPos[d * 3] = (Math.random() - 0.5) * 18;
    dustPos[d * 3 + 1] = 0.5 + Math.random() * 4.5;
    dustPos[d * 3 + 2] = -Math.random() * 90;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xFFE8C0,
    size: mobile ? 0.09 : 0.13,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));
  scene.add(dust);

  /* --- motion / cinema state --- */
  var travelled = 0, speed = 0, target = 24, intro = 0;
  var pointer = 0, pointerT = 0, lookY = 0, lookYT = 0;
  var clock = new THREE.Clock();
  var hudSpeed = document.querySelector('[data-speed]');

  requestAnimationFrame(function () {
    canvas.classList.add('is-live');
    var fb = document.querySelector('.hero-fallback');
    if (fb) fb.classList.add('is-hidden');
    document.documentElement.classList.add('drive-live');
    document.dispatchEvent(new CustomEvent('uj:drive-ready'));
  });

  window.addEventListener('pointermove', function (ev) {
    pointerT = (ev.clientX / window.innerWidth - 0.5) * 2;
    lookYT = (ev.clientY / window.innerHeight - 0.42) * -0.14;
    /* cabin parallax */
    var cabin = document.querySelector('.cabin');
    if (cabin) {
      cabin.style.transform = 'translate(' + (pointerT * -6) + 'px,' + (lookYT * -40) + 'px)';
    }
    var bonnet = document.querySelector('.bonnet');
    if (bonnet) {
      bonnet.style.transform = 'translate(calc(-50% + ' + (pointerT * 10) + 'px), ' + (Math.abs(pointerT) * 4) + 'px)';
    }
  }, { passive: true });

  window.addEventListener('scroll', function () {
    var sc = window.scrollY || 0;
    target = 24 + Math.min(sc / 32, 34);
    var fade = Math.max(0, 1 - sc / (window.innerHeight * 0.9));
    canvas.style.opacity = String(0.25 + fade * 0.75);
  }, { passive: true });

  var raf = 0;

  function frame() {
    raf = 0;
    if (reduced) { renderer.render(scene, camera); return; }
    if (document.hidden) return;

    var dt = Math.min(clock.getDelta(), 0.05);
    intro = Math.min(1, intro + dt * 0.28);
    var introEase = intro * intro * (3 - 2 * intro);

    var want = intro < 1 ? (4 + introEase * 20) : Math.max(target, 20 + introEase * 6);
    speed += (want - speed) * dt * 1.55;
    travelled += speed * dt;

    if (hudSpeed) hudSpeed.textContent = String(Math.round(speed * 1.15));

    roadGroup.position.z = travelled % SEG;
    edgeGroup.position.z = travelled % SEG;
    grassGroup.position.z = travelled % SEG;
    world.position.z = travelled % (SEG * 2);
    roadMap.offset.y = -(travelled * 0.045) % 1;

    var zl = -(travelled % SEG);
    var lx = laneX(zl), ly = laneY(zl);
    camera.position.x = lx;
    camera.position.y = ly + 2.02 + Math.sin(travelled * 0.6) * 0.03;

    pointer += (pointerT - pointer) * dt * 2.8;
    lookY += (lookYT - lookY) * dt * 2.4;
    var yaw = Math.atan(laneSlope(zl)) + pointer * 0.22;
    var pitch = lookY + Math.sin(travelled * 0.09) * 0.01;
    camera.rotation.set(pitch, yaw, -pointer * 0.045 + Math.sin(travelled * 0.07) * 0.01, 'YXZ');
    camera.fov = baseFov + Math.sin(travelled * 0.028) * 0.7 + (1 - introEase) * 8;
    camera.updateProjectionMatrix();

    /* headlights follow the lane ahead */
    var ahead = zl - 16;
    headL.position.set(lx - 0.65, ly + 1.05, zl + 0.4);
    headR.position.set(lx + 0.65, ly + 1.05, zl + 0.4);
    headL.target.position.set(laneX(ahead) - 1.1, laneY(ahead), ahead);
    headR.target.position.set(laneX(ahead) + 1.1, laneY(ahead), ahead);
    headL.target.updateMatrixWorld();
    headR.target.updateMatrixWorld();

    /* birds drift */
    birds.position.x = Math.sin(travelled * 0.01) * 8;
    birds.position.z = (travelled * 0.15) % 80;

    var arr = dust.geometry.attributes.position.array;
    for (var i = 0; i < DUST_N; i++) {
      arr[i * 3 + 2] += speed * dt * 0.9;
      arr[i * 3 + 1] += Math.sin(travelled * 0.2 + i) * 0.0025;
      if (arr[i * 3 + 2] > 5) {
        arr[i * 3] = (Math.random() - 0.5) * 16;
        arr[i * 3 + 1] = 0.4 + Math.random() * 4.2;
        arr[i * 3 + 2] = -70 - Math.random() * 40;
      }
    }
    dust.geometry.attributes.position.needsUpdate = true;
    dust.position.x = camera.position.x;

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
    } else { clock.getDelta(); start(); }
  });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  });

  start();
})();

(function () {
  'use strict';
  var canvas = document.getElementById('drive');
  if (!window.THREE || !canvas) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try {
    var lo = window.innerWidth < 700 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !lo, alpha: false, powerPreference: 'high-performance' });
  } catch (e) { return; }                     // no WebGL → painted fallback stays
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lo ? 1 : 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xE9C489);
  scene.fog = new THREE.Fog(0xE9C489, 90, 480);

  /* --- sky: painted gradient on a canvas texture --- */
  (function sky() {
    var c = document.createElement('canvas');
    c.width = 8; c.height = 256;
    var g = c.getContext('2d').createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0.00, '#0A1530');
    g.addColorStop(0.42, '#2B3C66');
    g.addColorStop(0.68, '#7E7F93');
    g.addColorStop(0.86, '#C79457');
    g.addColorStop(1.00, '#E9C489');
    var ctx = c.getContext('2d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 8, 256);
    var tex = new THREE.CanvasTexture(c);
    var dome = new THREE.Mesh(
      new THREE.SphereGeometry(900, 24, 16),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false })
    );
    scene.add(dome);
  })();

  var camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.5, 1400);
  camera.position.set(0, 2.05, 0);

  scene.add(new THREE.HemisphereLight(0xBFD2E8, 0x3B4A32, 0.95));
  var sun = new THREE.DirectionalLight(0xFFD9A8, 1.15);
  sun.position.set(-40, 26, -170);
  scene.add(sun);

  /* --- the lane. A periodic curve means the loop is seamless. --- */
  var SEG = 420;                 // period, world units
  var HALFW = 3.1;               // half road width — English lanes are narrow
  var AMP = 26;                  // how much the lane wanders

  function laneX(z) { return Math.sin(z / SEG * Math.PI * 2) * AMP; }
  function laneSlope(z) { return Math.cos(z / SEG * Math.PI * 2) * AMP * (Math.PI * 2 / SEG); }
  function laneY(z) { return Math.sin(z / SEG * Math.PI * 4) * 1.4; }   // gentle rise and fall

  function buildRibbon(width, colour, yLift) {
    var steps = 240, pos = [], idx = [];
    for (var i = 0; i <= steps; i++) {
      var z = -SEG * (i / steps);
      var x = laneX(z), y = laneY(z) + yLift;
      var nx = 1, nz = -laneSlope(z);
      var len = Math.hypot(nx, nz); nx /= len; nz /= len;
      pos.push(x - nx * width, y, z - nz * width);
      pos.push(x + nx * width, y, z + nz * width);
    }
    for (var s = 0; s < steps; s++) {
      var a = s * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, c, b, b, c, d);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: colour }));
  }

  var roadGroup = new THREE.Group(), grassGroup = new THREE.Group();
  for (var k = 0; k < 3; k++) {
    var r = buildRibbon(HALFW, 0x35383C, 0.02); r.position.z = -SEG * k; roadGroup.add(r);
    var v = buildRibbon(70, 0x4E6138, -0.06);  v.position.z = -SEG * k; grassGroup.add(v);
  }
  scene.add(grassGroup); scene.add(roadGroup);

  /* worn tarmac edges, no centre line — correct for an English lane */
  var edgeGroup = new THREE.Group();
  for (var e = 0; e < 3; e++) {
    var eg = buildRibbon(HALFW + 0.35, 0x2A2C2E, 0.005);
    eg.position.z = -SEG * e; edgeGroup.add(eg);
  }
  scene.add(edgeGroup);

  /* --- hedgerows, drystone and trees, instanced for speed --- */
  function scatter(geo, mat, count, place) {
    var mesh = new THREE.InstancedMesh(geo, mat, count);
    var m = new THREE.Matrix4(), q = new THREE.Quaternion(),
        p = new THREE.Vector3(), s = new THREE.Vector3();
    for (var i = 0; i < count; i++) {
      place(i, p, s, q);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }

  var world = new THREE.Group();
  scene.add(world);

  var HEDGE_N = 140;
  var hedge = scatter(
    new THREE.SphereGeometry(1, 6, 5),
    new THREE.MeshLambertMaterial({ color: 0x2F4A26 }),
    HEDGE_N,
    function (i, p, s, q) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / HEDGE_N) * SEG * 2;
      var off = HALFW + 1.15 + Math.random() * 0.5;
      p.set(laneX(z) + side * off, laneY(z) + 0.9 + Math.random() * 0.5, z);
      s.set(1.5 + Math.random(), 1.5 + Math.random() * 1.1, 1.5 + Math.random());
      q.identity();
    });
  world.add(hedge);

  var TREE_N = 48;
  var trunks = scatter(
    new THREE.CylinderGeometry(0.22, 0.34, 7, 5),
    new THREE.MeshLambertMaterial({ color: 0x4A3A2A }),
    TREE_N,
    function (i, p, s, q) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / TREE_N) * SEG * 2 - Math.random() * 6;
      p.set(laneX(z) + side * (HALFW + 3.4 + Math.random() * 3), laneY(z) + 3.4, z);
      s.set(1, 1, 1); q.identity();
    });
  world.add(trunks);

  var canopy = scatter(
    new THREE.SphereGeometry(3.6, 7, 6),
    new THREE.MeshLambertMaterial({ color: 0x33512B }),
    TREE_N,
    function (i, p, s, q) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / TREE_N) * SEG * 2 - Math.random() * 6;
      p.set(laneX(z) + side * (HALFW + 3.2 + Math.random() * 3), laneY(z) + 7.6 + Math.random() * 1.6, z);
      var sc = 0.85 + Math.random() * 0.7; s.set(sc, sc * 0.85, sc); q.identity();
    });
  world.add(canopy);

  /* fence posts give speed a readable rhythm */
  var POST_N = 100;
  var posts = scatter(
    new THREE.BoxGeometry(0.13, 1.15, 0.13),
    new THREE.MeshLambertMaterial({ color: 0x6B5B44 }),
    POST_N,
    function (i, p, s, q) {
      var side = i % 2 ? 1 : -1;
      var z = -(i / POST_N) * SEG * 2;
      p.set(laneX(z) + side * (HALFW + 0.75), laneY(z) + 0.55, z);
      s.set(1, 1, 1); q.identity();
    });
  world.add(posts);

  /* distant hills */
  var hills = scatter(
    new THREE.ConeGeometry(90, 34, 6),
    new THREE.MeshLambertMaterial({ color: 0x5A6B55 }),
    14,
    function (i, p, s, q) {
      var z = -80 - i * 90;
      p.set((i % 2 ? 1 : -1) * (110 + Math.random() * 130), -4, z);
      var sc = 0.7 + Math.random() * 0.9; s.set(sc, sc, sc); q.identity();
    });
  world.add(hills);

  /* --- motion --- */
  var travelled = 0, speed = 26, target = 26, pointer = 0, pointerT = 0;
  var clock = new THREE.Clock();

  window.addEventListener('pointermove', function (ev) {
    pointerT = (ev.clientX / window.innerWidth - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('scroll', function () {
    var d = window.scrollY || 0;
    target = 26 + Math.min(d / 40, 26);
  }, { passive: true });

  var raf = 0, running = false;

  function frame() {
    raf = 0;
    if (reduced) {
      renderer.render(scene, camera);
      return;
    }
    if (document.hidden) { running = false; return; }

    var dt = Math.min(clock.getDelta(), 0.05);
    speed += (target - speed) * dt * 1.4;
    travelled += speed * dt;

    roadGroup.position.z = travelled % SEG;
    edgeGroup.position.z = travelled % SEG;
    grassGroup.position.z = travelled % SEG;
    world.position.z = travelled % (SEG * 2);

    /* keep the car on the lane: the road point under the camera */
    var zl = -(travelled % SEG);
    camera.position.x = laneX(zl);
    camera.position.y = laneY(zl) + 2.05;

    pointer += (pointerT - pointer) * dt * 2.4;
    var yaw = Math.atan(laneSlope(zl)) + pointer * 0.16;
    camera.rotation.set(0, yaw, 0, 'YXZ');
    camera.rotation.z = -pointer * 0.03 + Math.sin(travelled * 0.05) * 0.006;

    renderer.render(scene, camera);
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reduced || document.hidden) { frame(); return; }
    if (!raf) raf = requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0; running = false;
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

  start();                       /* reduced motion → renders one still frame */
})();

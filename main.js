import WindowManager from "./WindowManager.js";

const t = THREE;
let camera, scene, renderer, world, text, cbMain;
let near, far;
let pixR = window.devicePixelRatio ? window.devicePixelRatio : 1;
let cubes = [];
let cubesText = [];
let cubeMain = [];

let sceneOffsetTarget = { x: 0, y: 0 };
let sceneOffset = { x: 0, y: 0 };

let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime();

let internalTime = getTime();
let windowManager;
let initialized = false;

function getTime() {
  return (new Date().getTime() - today) / 1000.0;
}

if (new URLSearchParams(window.location.search).get("clear")) {
  localStorage.clear();
} else {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState != "hidden" && !initialized) {
      init();
    }
  });

  window.onload = () => {
    if (document.visibilityState != "hidden") {
      init();
    }
  };

  function init() {
    initialized = true;

    setTimeout(() => {
      setupScene();
      setupWindowManager();
      resize();
      updateWindowShape(false);
      render();
      window.addEventListener("resize", resize);
    }, 500);
  }

  function setupScene() {
    camera = new t.OrthographicCamera(
      0,
      0,
      window.innerWidth,
      window.innerHeight,
      -10000,
      10000
    );

    camera.position.z = 2.5;
    near = camera.position.z - 0.5;
    far = camera.position.z + 0.5;

    scene = new t.Scene();
    scene.background = new t.Color(0.0);
    scene.add(camera);

    renderer = new t.WebGLRenderer({ antialias: true, depthBuffer: true });
    renderer.setPixelRatio(pixR);

    world = new t.Object3D();
    text = new t.Object3D();
    cbMain = new t.Object3D();

    scene.add(world);
    scene.add(text);
    scene.add(cbMain);

    renderer.domElement.setAttribute("id", "scene");
    document.body.appendChild(renderer.domElement);
  }

  function setupWindowManager() {
    windowManager = new WindowManager();
    windowManager.setWinShapeChangeCallback(updateWindowShape);
    windowManager.setWinChangeCallback(windowsUpdated);

    let metaData = { foo: "bar" };

    windowManager.init(metaData);
    windowsUpdated();
  }

  function windowsUpdated() {
    updateNumberOfCircle();
    updateText();
    updateNumberOfCubes();
  }

  function updateText() {
    let wins = windowManager.getWindows();

    cubesText.forEach((c) => {
      text.remove(c);
    });

    cubesText = [];

    for (let i = 0; i < wins.length; i++) {
      let win = wins[i];

      let fontLoader = new t.FontLoader();
      fontLoader.load(
        "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
        function (font) {
          let textGeometry = new t.TextGeometry("Vinh___NT", {
            font: font,
            size: 20,
            height: 3,
          });
          let textMaterial = new t.MeshBasicMaterial({ color: 0xffffff });
          let textMesh = new t.Mesh(textGeometry, textMaterial);
          textMesh.position.x = win.shape.x + win.shape.w * 0.5;
          textMesh.position.y = win.shape.y + win.shape.h * 0.5;

          world.add(textMesh);
          cubesText.push(textMesh);
        }
      );
    }
  }

  function updateNumberOfCircle() {
    let wins = windowManager.getWindows();

    cubes.forEach((c) => {
      world.remove(c);
    });

    cubes = [];

    for (let i = 0; i < wins.length; i++) {
      let win = wins[i];

      let aquaColor = new t.Color("#6bbadb");

      let s = 100 + i * 50 - 100;
      let orangeGeometry = new t.SphereGeometry(s / 2, 32, 32);
      let orangeMaterial = new t.MeshBasicMaterial({
        color: aquaColor,
        wireframe: true,
      });
      let orange = new t.Mesh(orangeGeometry, orangeMaterial);
      orange.position.x = win.shape.x + win.shape.w * 2.5;
      orange.position.y = win.shape.y + win.shape.h * 2.5;

      world.add(orange);
      cubes.push(orange);
    }
  }
  function updateNumberOfCubes() {
    let wins = windowManager.getWindows();

    // remove all cubes
    cubeMain.forEach((c) => {
      world.remove(c);
    });

    cubeMain = [];

    for (let i = 0; i < wins.length; i++) {
      let win = wins[i];

      let c = new t.Color();
      c.setHSL(i * 0.1, 1.0, 0.5);

      let s = 100 + i * 150;
      let cubeM = new t.Mesh(
        new t.BoxGeometry(s, s, s),
        new t.MeshBasicMaterial({ color: c, wireframe: true, linewidth: 15 })
      );

      cubeM.position.x = -win.shape.x + win.shape.w * 0.5;
      cubeM.position.y = -win.shape.y + win.shape.h * 0.5;

      world.add(cubeM);
      cubeMain.push(cubeM);
    }
  }

  function updateWindowShape(easing = true) {
    sceneOffsetTarget = { x: -window.screenX, y: -window.screenY };
    if (!easing) sceneOffset = sceneOffsetTarget;
  }

  function render() {
    let t = getTime();

    windowManager.update();

    let falloff = 0.05;
    sceneOffset.x =
      sceneOffset.x + (sceneOffsetTarget.x - sceneOffset.x) * falloff;
    sceneOffset.y =
      sceneOffset.y + (sceneOffsetTarget.y - sceneOffset.y) * falloff;

    world.position.x = sceneOffset.x;
    world.position.y = sceneOffset.y;

    let wins = windowManager.getWindows();

    for (let i = 0; i < cubes.length; i++) {
      let orange = cubes[i];
      let win = wins[i];
      let _t = t;

      let posTarget = {
        x: win.shape.x + win.shape.w * 0.5,
        y: win.shape.y + win.shape.h * 0.5,
      };

      orange.position.x =
        orange.position.x + (posTarget.x - orange.position.x) * falloff;
      orange.position.y =
        orange.position.y + (posTarget.y - orange.position.y) * falloff;
      orange.rotation.x = _t * 0.5;
      orange.rotation.y = _t * 0.3;
    }

    for (let i = 0; i < cubesText.length; i++) {
      let text = cubesText[i];
      let win = wins[i];
      let _t = t; // + i * .2;

      let posTarget = {
        x: win.shape.x + win.shape.w * 0.5,
        y: win.shape.y + win.shape.h * 0.5,
      };

      text.position.x =
        text.position.x + (posTarget.x - text.position.x) * falloff;
      text.position.y =
        text.position.y + (posTarget.y - text.position.y) * falloff + 4;
      text.rotation.x = _t * 1.5;
      text.rotation.y = _t * 1.3;
    }

    for (let i = 0; i < cubeMain.length; i++) {
      let cubeMainLoop = cubeMain[i];
      let win = wins[i];
      let _t = t; // + i * .2;

      let posTarget = {
        x: win.shape.x + win.shape.w * 0.8,
        y: win.shape.y + win.shape.h * 0.8,
      };

      cubeMainLoop.position.x =
        cubeMainLoop.position.x +
        (posTarget.x - cubeMainLoop.position.x) * falloff;
      cubeMainLoop.position.y =
        cubeMainLoop.position.y +
        (posTarget.y - cubeMainLoop.position.y) * falloff;
      cubeMainLoop.rotation.x = _t * 0.5;
      cubeMainLoop.rotation.y = _t * 0.3;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function resize() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    camera = new t.OrthographicCamera(0, width, 0, height, -10000, 10000);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
}

// import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlaneFactory } from './objects/plane_factory';

let scene, camera, renderer, controls;

let curJet = null; // Store jet globally
let curJetNum = 1;
let rotationSpeed = 0.5; // radians per second
let isRotating = true;
let jets = [];

init();
for (let i = 1; i < 7; i++){
  loadJet(i);
}

function changeJet(num){
  curJetNum += num;
  if (curJetNum == 0) curJetNum = 6;
  if (curJetNum == 7) curJetNum = 1;
  scene.remove(curJet);
  curJet = jets[curJetNum - 1];
  scene.add(curJet);
}


function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(2.5, 2.5, 2.5); // x: right, y: up, z: front

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('jet-canvas'), antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 2;
  controls.maxDistance = 10;

  controls.addEventListener('start', () => { isRotating = false; });
  controls.addEventListener('end', () => { isRotating = true; });

  document.getElementById('left-arrow').addEventListener('click', () => changeJet(-1));
  document.getElementById('right-arrow').addEventListener('click', () => changeJet(1));


  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  animate();
}


async function loadJet(jetNum) {
  const factory = new PlaneFactory();
  const jet = await factory.createPlayer(jetNum.toString()); // Pass your desired plane number
  jet.position.set(0, 0, 0); // Center of scene
  jet.scale.set(0.5, 0.5, 0.5); // Center of scene
  jets.push(jet);
  if (jetNum == 1){
    curJet = jet;
    scene.add(jet);
  }
}

function animate(time) {
  requestAnimationFrame(animate);
  if (isRotating && curJet) {
    curJet.rotation.y += rotationSpeed * 0.001; // time in ms
  }
  controls.update();
  renderer.render(scene, camera);
}

document.getElementById('startButton').addEventListener('click', () => {
  const url = `game.html?player=${curJetNum}`;
  window.location.href = url;
});

import { LoaderHelper } from "@/utils/loader_helper";
import * as THREE from "three";
import {
  OrbitControls,
  PointerLockControls,
} from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import texturesprite from "@/assets/spritesheet_tiles.png";
import { Terrain } from "@/objects/terrain/terrain";
import { ControlService } from "@/logics/control";

/** @import { Debugger } from '@/tools/debugger'*/

/**
 * @property {THREE.Scene} scene
 * @property {OrbitControls | PointerLockControls} control
 * @property {THREE.Camera} camera
 * @property {Debugger} debugger
 * @property {THREE.AxesHelper} axesHelper
 * @property {Stats} stats
 */
export class Bootstrap {
  /**
   * @param {Debugger} debuggerCtl
   * */
  constructor(debuggerCtl) {
    this.debugger = debuggerCtl;
    this.#Init();
  }

  #Init() {
    this.renderer = this.CreateRenderer();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#96c5fa");

    const fogColor = "#96c5fa"; // Match background color
    // Start fog a bit inside the fully loaded view distance, end it a bit beyond.
    const nearFogDistance =
      Terrain.TERRAIN_CHUNk_LIMIT * (ControlService.VIEW_DISTANCE - 1.5);
    const farFogDistance =
      Terrain.TERRAIN_CHUNk_LIMIT * (ControlService.VIEW_DISTANCE + 1.5);
    this.scene.fog = new THREE.Fog(fogColor, nearFogDistance, farFogDistance);

    this.camera = this.CreateCamera();
    this.axesHelper = this.CreateAxesHelper();
    this.stats = this.CreateStat();

    this.control = this.CreateControl();
  }

  CreateRenderer() {
    const canvas = document.querySelector('#my_canvas');
    const renderer = new THREE.WebGLRenderer({ antialias: false, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.physicallyCorrectLights = true;
    renderer.setPixelRatio(window.devicePixelRatio * 0.9);

    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = PCFSoftShadowMap;
    return renderer;
  }

  CreateCamera() {
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    //const camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 0.1, 1000);
    // camera.position.set(60, 40, -40);
    camera.position.set(0, 50, -50);

    const cameraFolder = this.debugger.addFolder("Camera");

    cameraFolder.add(camera.position, "x", -100, 100);
    cameraFolder.add(camera.position, "y", -100, 100);
    cameraFolder.add(camera.position, "z", -100, 100);

    cameraFolder.open();

    camera.updateProjectionMatrix();

    return camera;
  }

  CreateAxesHelper() {
    const axesHelper = new THREE.AxesHelper(3);
    this.scene.add(axesHelper);

    return axesHelper;
  }

  CreateStat() {
    const stats = Stats();
    document.body.appendChild(stats.dom);

    return stats;
  }

  CreatePointLockControl() {
    const controls = new PointerLockControls(
      this.camera,
      this.renderer.domElement
    );

    return controls;
  }
  noiseProps;
  CreateControl() {
    const orbCtl = new OrbitControls(this.camera, this.renderer.domElement);
    orbCtl.update();

    /* NOTE:
     * Only re-render when the control change gives us better performance
     * */
    orbCtl.addEventListener("change", () => {
      this.renderer.render(this.scene, this.camera);
    });
    // orbCtl.dampingFactor = 0.07;
    // orbCtl.enableDamping = true;

    return orbCtl;
  }

  async InitTexture() {
    const texture = await LoaderHelper.LoadTextureAsync(texturesprite);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    this.texture = texture;
  }

  OnWindowResize() {
    // const canvas = this.renderer.domElement;
    const width = window.innerWidth;
    const height = window.innerHeight;
    // const canvasPixelW = canvas.width / window.devicePixelRatio;
    // const canvasPixelH = canvas.height / window.devicePixelRatio;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio * 0.5);
    this.renderer.render(this.scene, this.camera);
  }

  DisposeScene() {
    this.scene.dispose();
  }

  DisposeRenderer() {
    // disposing renderer
    this.renderer.hideCanvas();
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}

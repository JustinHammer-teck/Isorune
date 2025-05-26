import { Bootstrap } from "@/core/bootstrap";
import { Loop } from "@/core/loop";

import { ControlService } from "@/logics/control";
import { ProjectileFactory } from "@/objects/projectile_factory";
import { PlaneControl } from "@/logics/plane_control";
import { PlayerInteractionControl } from "@/logics/player_interaction_control";
import { Character } from "@/objects/character/character";
import { PlaneFactory } from "@/objects/plane_factory";
import { BuildingFactory } from "@/objects/building_factory";
import { BuildingControl } from "@/logics/building_control";
import { TreeFactory } from "@/objects/tree_factory";
import { TreeControl } from "@/logics/tree_control";
import { Terrain } from "@/objects/terrain/terrain";
import { Debugger } from "@/tools/debugger";
import {
  AmbientLight,
  Vector2,
  Vector3,
  DirectionalLight,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
} from "three";
import { ProjectileControl } from "@/logics/projectile_control";

/** @import { Scene  } from 'three'; */
/** @import { Bootstrap } from '@/core/bootstrap'; */

/** Apply Singleton Pattern
 *  @property {App} instance
 *  @property {Bootstrap} config
 *  @property {Loop} loop
 *  @property {Scene} scene
 *  @property {WebGLRenderer} renderer
 *  @property {Camera} camera
 *  @property {Debugger} debugger
 *  @property {TreeFactory} treeFactory
 *  @property {TreeControl} treeCtrl
 * */
export class App {
  static _instance;

  constructor() {
    if (App._instance) {
      return App._instance;
    }

    this.state = 0;
  }

  static get instance() {
    if (typeof App._instance === "undefined") {
      App._instance = new App();
    }

    return App._instance;
  }

  /** @return {Scene} */
  get scene() {
    return this.config.scene;
  }

  get camera() {
    return this.config.camera;
  }

  get renderer() {
    return this.config.renderer;
  }

  setPlayerNum(playerNumString){
    this.playerNum = playerNumString;
  }

  async InitAsync() {
    this.debugger = new Debugger();

    const bootstrap = new Bootstrap(this.debugger);
    await bootstrap.InitTexture();

    this.config = bootstrap;

    this.loop = new Loop(this.renderer, this.scene, this.camera);
    window.addEventListener("resize", this.config.OnWindowResize, false);

    const amlight = new AmbientLight(0xffffff, 1);
    this.AddObject(amlight);
  }

  async StartAsync() {
    this.loop.Start();

    const terrain = new Terrain(this.debugger, this.config.texture);

    // Tree system will be initialized after player is created, similar to buildings.

    this.planeFactory = new PlaneFactory(this);
    this.planeFactory.createPlayer(this.playerNum)
      .then(async (player) => {
        this.player = player;
        const controlSrv = new ControlService(terrain, player, this);
        this.AddObject(player);
        this.AddToLoop(player);
        this.AddToLoop(controlSrv);


        // Initialize Tree System
        this.treeFactory = new TreeFactory(this);
        this.treeCtrl = new TreeControl(this);
        this.loop.Add(this.treeCtrl);
        try {
          await this.treeCtrl.initializeTrees(terrain);
        } catch (error) {
          console.error("Error initializing trees:", error);
        }

        // Initialize building system
        this.buildingFactory = new BuildingFactory(this);
        this.buildingCtrl = new BuildingControl(this);
        this.loop.Add(this.buildingCtrl);
        if (this.buildingCtrl.initializeBuildings) {
          this.buildingCtrl.initializeBuildings(terrain);
        }
      })
      .catch((error) => {
        console.error("❌ Failed to create player:", error);
        // Optionally show an alert or fallback:
        // alert("Could not load player model.");
      });

    this.planeCtrl = new PlaneControl(this);
    for (let i = 0; i < 10; i++) {
      await this.planeCtrl.generatePlane();
    }

    this.loop.Add(this.planeCtrl);

    this.projectileFactory = new ProjectileFactory(this);
    this.projectileCtrl = new ProjectileControl(this);
    this.loop.Add(this.projectileCtrl);

    this.playerCtrl = new PlayerInteractionControl(this, terrain);
    this.loop.Add(this.playerCtrl);
  }

  AddToLoop(object) {
    this.loop.Add(object);
  }

  AddObject(object) {
    this.scene.add(object);
  }

  /** Dispose Object in the scene
   * @param {Object3D} object
   * */
  DisposeObject(object) {
    this.scene.remove(object);
    this.loop.Remove(object);
    this.renderer.renderLists.dispose();
  }

  Stop() {
    this.loop.Stop();
  }
}

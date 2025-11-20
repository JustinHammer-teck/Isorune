import { Bootstrap } from '@/core/bootstrap';
import { Loop } from '@/core/loop';
import ControlService from '@/logics/control';
import { Character } from '@/objects/character/character';
import { Terrain } from '@/objects/terrain/';
import { Debugger } from '@/tools/debugger';
import { Vector2 } from '@/utils/vector_helper';
import { AmbientLight } from 'three';

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
    if (typeof App._instance === 'undefined') {
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

  async InitAsync() {
    this.debugger = new Debugger();

    const bootstrap = new Bootstrap(this.debugger);
    await bootstrap.InitTexture();

    this.config = bootstrap;

    this.loop = new Loop(this.renderer, this.scene, this.camera);
    window.addEventListener('resize', this.config.OnWindowResize, false);

    const amlight = new AmbientLight(0xffffff, 1);
    this.AddObject(amlight);
  }

  async StartAsync() {
    this.loop.Start();

    const terrain = new Terrain(this.debugger, this.config.texture);

    const character = new Character(new Vector2(75, 75));
    this.AddObject(character.mesh);

    const controlSrv = new ControlService(terrain, character, this);
    this.AddToLoop(controlSrv);
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
    this.renderer.renderLists.dispose();
  }

  Stop() {
    this.loop.Stop();
  }
}

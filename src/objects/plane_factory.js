import { MIN_SPEED } from '@/logics/player_interaction_control';
import { MTLLoader } from 'three/examples/jsm/Addons';
import { OBJLoader } from 'three/examples/jsm/Addons';
import { Mesh } from 'three';
import { Explosion } from './explosion';


const MIN_PLANE_NUM = 1;
const MAX_PLANE_NUM = 6;
const MAX_BULLET_NUM = 50;
const BULLET_RELOAD_TIME = 1;


export class PlaneFactory {

  constructor(app) {
    this.app = app
    this.playerNumber = 0;
  }

  async createPlayer(planeNumber) {
    try {
      const mtlLoader = new MTLLoader();
      mtlLoader.setPath('src/assets/planes/');
      const materials = await mtlLoader.loadAsync(`Plane0${planeNumber}.mtl`);
      materials.preload();

      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('src/assets/planes/');
      const object = await objLoader.loadAsync(`Plane0${planeNumber}.obj`);

      // Setup object properties
      object.position.y = 200;
      object.rotation.y = -Math.PI / 2;
      object.speed = MIN_SPEED;
      object.bulletNum = MAX_BULLET_NUM;
      object.bulletReload = BULLET_RELOAD_TIME;
      object.scale.set(0.01, 0.01, 0.01);

      object.Tick = (delta) => {
        if (object.bulletNum <= 0) {
          if (object.bulletReload <= 0) {
            object.bulletReload = BULLET_RELOAD_TIME;
            object.bulletNum = MAX_BULLET_NUM;
          } else {
            object.bulletReload -= delta;
          }
        }
      };

      object.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry.computeBoundingBox();
          object.bBox = child.geometry.boundingBox;
        }
      });

      return object;

    } catch (err) {
      console.error("❌ Failed to load player model:", err);
      throw err;
    }
  }



  async createPlane(position) {
    const planeNumber = this.getRandomPlaneNum();
    // const planeNumber = 6;
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('src/assets/planes/');
    mtlLoader.load(`Plane0${planeNumber}.mtl`, (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('src/assets/planes/');
      objLoader.load(`Plane0${planeNumber}.obj`, (object) => {
        object.speed = MIN_SPEED;
        object.scale.set(0.03, 0.03, 0.03);
        object.rotation.y -= Math.random() * Math.PI;
        object.hitpoint = 10;
        object.app = this.app;

        object.position.copy(position);
        object.Tick = () => {
          object.translateX(object.speed);
          object.translateZ(object.speed / 2);
          if (object.hitpoint <= 0) {
            const exp = new Explosion(object.position, object.app);
            this.app.AddObject(exp);
            this.app.AddToLoop(exp);
            object.app.DisposeObject(object);
          }
        }
        object.traverse(function (child) {
          if (child instanceof Mesh) {
            child.geometry.computeBoundingBox();
            object.bBox = child.geometry.boundingBox;//<-- Actually get the variable
          }
        });
        this.app.AddObject(object);
        this.app.AddToLoop(object);
        this.app.planeCtrl.planes.push(object);
      },
        (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
        (error) => console.error('An error happened while loading the OBJ:', error));
    });

  }

  getRandomPlaneNum() {
    const minCeiled = MIN_PLANE_NUM;
    const maxFloored = MAX_PLANE_NUM + 1;
    const result = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
    return result == this.playerNumber ? this.getRandomPlaneNum() : result;
  }

}
import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { App } from '@/core/app';
/** @import * as THREE from 'three'*/

/**
 * @class
 * @public
 * @property {BoxGeometry} mesh
 * */
export class Character {
  /**
   * @param {THREE.Vector2} position
   * */
  constructor(position) {
    const geo = new BoxGeometry(10, 10, 10);
    geo.translate(position.x, 10, position.y);
    const mat = new MeshBasicMaterial({ color: 0xfff000 });
    const mesh = new Mesh(geo, mat);
    this.mesh = mesh;
  }

  /**
   * @param {THREE.Vector2} coordinate
   * */
  SpawnAt(coordinate) {
    this.mesh.translate(coordinate.x, 1 * 0.5, coordinate.y);
  }
}

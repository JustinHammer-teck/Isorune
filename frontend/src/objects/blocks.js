import { PlaneGeometry } from 'three';

/**@namespace Voxel*/

/**
 * Enum for Voxel Type
 * @readonly
 * @memberof Voxel
 * @enum {number}
 */
export const BlockType = {
  WATER: 0,
  SAND: 1,
  SOIL: 2,
  GRASS: 3,
  ROCk: 4,
  SNOW_ROCk: 5,
  SNOW_DIRT: 6,
  AIR: 7,
};

export const VoxelFace = {
  TOP: 0,
  FRONT: 1,
  BACk: 2,
  LEFT: 3,
  RIGHT: 4,
};

export default class Block {
  /**
   * @param {BlockType} type
   * */
  constructor(type) {
    this.type = type;
    this.faces = new Array(5);
    const size = 1;

    this.size = size;

    this.faces[VoxelFace.RIGHT] = new PlaneGeometry(size, size).rotateY(
      Math.PI / 2,
    );

    this.faces[VoxelFace.LEFT] = new PlaneGeometry(size, size).rotateY(
      -Math.PI / 2,
    );

    this.faces[VoxelFace.TOP] = new PlaneGeometry(size, size).rotateX(
      -Math.PI / 2,
    );

    this.faces[VoxelFace.FRONT] = new PlaneGeometry(size, size);
    this.faces[VoxelFace.BACk] = new PlaneGeometry(size, size).rotateY(Math.PI);
  }

  IsTransparent() {
    return this.type == BlockType.AIR || this.type == BlockType.WATER;
  }

  /**
   * @param {VoxelFace} faceDirection
   * @param {number} [size=1]
   *
   * @return {PlaneGeometry}
   * */
  GetFace(faceDirection, size = 2) {
    const face = this.faces[faceDirection].clone();

    face.scale(size, size, size);

    const half = size * 0.5;

    if (faceDirection == VoxelFace.RIGHT) {
      face.translate(size, half, half);
    } else if (faceDirection == VoxelFace.LEFT) {
      face.translate(0, half, half);
    } else if (faceDirection == VoxelFace.TOP) {
      face.translate(half, size, half);
    } else if (faceDirection == VoxelFace.FRONT) {
      face.translate(half, half, size);
    } else if (faceDirection == VoxelFace.BACk) {
      face.translate(half, half, 0);
    }

    face.computeVertexNormals();
    return face;
  }

  /**
   * @param {VoxelFace} face
   * @param {Float32Array} uvAttribute
   * */
  SetUVCoordinate(face, uvAttribute) {
    if (this.faces[face] != null) {
      Block.SetUV(this.faces[face], uvAttribute);
    }
  }

  /**
   * @param {Float32Array} uvAttribute
   * @param {Array} excludes
   * */
  SetAllFacesUVCoordinate(uvAttribute, excludes = []) {
    for (const face of Object.values(VoxelFace)) {
      if (!excludes.includes(face)) {
        this.SetUVCoordinate(face, uvAttribute);
      }
    }
  }

  /**
   * @param {BufferGeometry} geometry
   * @param {Float32Array} uvAttribute
   * */
  static SetUV(geometry, uvAttribute) {
    geometry.computeVertexNormals();
    geometry.attributes.uv.set(uvAttribute);
    geometry.attributes.uv.needsUpdate = true;
  }
}

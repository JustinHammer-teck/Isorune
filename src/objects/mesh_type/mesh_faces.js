import { InstancedMesh, Matrix4, StaticDrawUsage } from "three";
import Block, { BlockType, VoxelFace } from "@/objects/blocks";
import { Terrain, Chunk } from "@/objects/terrain";

export default class MeshFaces {
  constructor(material, voxelDefinition) {
    this.meshFacesInstace = new Array(5);
    this.ndx = new Array(5).fill(0);

    this.material = material;

    /** @type {Block}*/
    this.voxel = voxelDefinition;

    this.matrix4buffer = new Matrix4();
  }

  /**
   * @param {VoxelFace} face
   * @param {number} count
   * @param {number} size
   *
   * @returns {InstancedMesh}
   * */
  GetOrCreateMeshFace(face, count, size) {
    if (this.meshFacesInstace[face]) {
      return this.meshFacesInstace[face];
    }

    const voxelFace = this.voxel.GetFace(face, size);
    const mesh = new InstancedMesh(voxelFace, this.material, count);

    mesh.castShadow = false;
    mesh.receiveShadow = true;

    mesh.instanceMatrix.setUsage(StaticDrawUsage);

    return (this.meshFacesInstace[face] = mesh);
  }

  /**
   * @param {Vector3} coordinate
   * @param {Map} blocks
   * @param {Chunk} chunk
   * */
  async BuildMeshFacesAsync(coordinate, blocks, chunk) {
    const { edge, LOD: size } = chunk;
    const { x, y, z } = coordinate;

    const top_count_buffer =
      Terrain.TERRAIN_CHUNk_LIMIT * Terrain.TERRAIN_CHUNk_LIMIT;
    const side_count_buffer =
      Terrain.TERRAIN_CHUNk_HEIGHT * Terrain.TERRAIN_CHUNk_LIMIT;

    const _shouldPlaceMeshFace = (dx, dy, dz, faceDirection) => {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;

      const neighborKey = `${nx},${nz},${ny}`;
      const neighborBlock = blocks.get(neighborKey);
      const neighborBlockType = neighborBlock
        ? neighborBlock.type
        : BlockType.AIR;

      return neighborBlockType === BlockType.AIR;
    };

    this.matrix4buffer.makeTranslation(x, z, y);

    if (_shouldPlaceMeshFace(size, 0, 0, VoxelFace.RIGHT)) {
      await this.AddInstanceGeometry(VoxelFace.RIGHT, side_count_buffer, size);
    }

    if (_shouldPlaceMeshFace(-size, 0, 0, VoxelFace.LEFT)) {
      await this.AddInstanceGeometry(VoxelFace.LEFT, side_count_buffer, size);
    }

    if (_shouldPlaceMeshFace(0, 0, size, VoxelFace.TOP)) {
      await this.AddInstanceGeometry(VoxelFace.TOP, top_count_buffer, size);
    }

    if (_shouldPlaceMeshFace(0, size, 0, VoxelFace.FRONT)) {
      await this.AddInstanceGeometry(VoxelFace.FRONT, side_count_buffer, size);
    }

    if (_shouldPlaceMeshFace(0, -size, 0, VoxelFace.BACk)) {
      await this.AddInstanceGeometry(VoxelFace.BACk, side_count_buffer, size);
    }
  }

  async AddInstanceGeometry(faceDirection, count, size) {
    const mesh = this.GetOrCreateMeshFace(faceDirection, count, size);

    if (!mesh) {
      return;
    }

    mesh.setMatrixAt(this.ndx[faceDirection], this.matrix4buffer);

    this.ndx[faceDirection]++;
  }

  FinalizeMeshFace() {
    this.meshFacesInstace.forEach((mesh, face) => {
      mesh.count = this.ndx[face];
      mesh.instanceMatrix.needsUpdate = true;
    });
  }

  HideAll() {
    for (const meshFace of Object.values(VoxelFace)) {
      this.meshFacesInstace[meshFace].visible = false;
    }
  }

  Hide(meshFace) {
    this.meshFacesInstace[meshFace].visible = false;
  }

  ShowAll() {
    for (const meshFace of Object.values(VoxelFace)) {
      this.meshFacesInstace[meshFace].visible = true;
    }
  }

  Show(meshFace) {
    this.meshFacesInstace[meshFace].visible = true;
  }
}

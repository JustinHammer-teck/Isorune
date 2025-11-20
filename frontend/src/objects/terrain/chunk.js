import { Matrix4, Vector2, Vector3 } from 'three';
import MeshFaces from '@/objects/mesh_type/mesh_faces';
import TransparentFaces from '@/objects/mesh_type/transparent_mesh';
import { Terrain } from '@/objects/terrain';
import Biome from '../biome';

/**
 * @property {GeoContainer[]} blockTypes
 * @property {Vector2} edge
 * @property {number} size
 * @property {Group} group
 * @property {Array.<MeshFaces>} meshFaces
 *
 * */
export class Chunk {
  /**
   * @param {Vector2} coordinate
   * @param {number} size
   * @param {number} levelOfDetail
   * */
  constructor(coordinate, size, levelOfDetail) {
    this.coordinate = new Vector2().copy(coordinate);
    this.size = size;
    this.edge = {
      maxEdge: new Vector2(
        coordinate.x * this.size + this.size,
        coordinate.y * this.size + this.size,
      ),
      minEdge: new Vector2(coordinate.x * this.size, coordinate.y * this.size),
    };

    this.LOD = levelOfDetail;

    /** @type {Array<MeshFaces>}*/
    this.blockTypeMeshFaces = new Array(10);

    this.vector3Buffer = new Vector3();
  }

  /**
   * @param {*} blocks
   * @param {*} material
   * @param {Biome} biome
   * */
  async CreateAsync(blocks, material, biome) {
    const workerData = {
      chunk: this,
      blocks: blocks,
      biome: biome,
      buffer: this.matrix4Buffer,
    };

    const size = this.LOD;

    const edge = this.edge;
    const minX = edge.minEdge.x;
    const maxX = edge.maxEdge.x;
    const minY = edge.minEdge.y;
    const maxY = edge.maxEdge.y;

    const minZ = 0;
    const maxZ = Terrain.TERRAIN_CHUNk_HEIGHT;

    const _getOrCreateMeshFace = (blockType) => {
      let blockMeshFaces = this.blockTypeMeshFaces[blockType];
      if (blockMeshFaces) {
        return blockMeshFaces;
      }

      try {
        const voxelInfo = biome.GetBlock(blockType);
        if (!voxelInfo) {
          console.warn(
            `No biome voxel info found for block type: ${blockType}`,
          );
        }

        if (voxelInfo.IsTransparent()) {
          blockMeshFaces = new TransparentFaces(material, voxelInfo);
          this.blockTypeMeshFaces[blockType] = blockMeshFaces;
        } else {
          blockMeshFaces = new MeshFaces(material, voxelInfo);
          this.blockTypeMeshFaces[blockType] = blockMeshFaces;
        }

        return blockMeshFaces;
      } catch (error) {
        console.error(error);
      }
    };

    for (let y = minY; y < maxY; y += size) {
      for (let x = minX; x < maxX; x += size) {
        for (let z = minZ; z <= maxZ; z += size) {
          const key = `${x},${z},${y}`;
          if (!blocks.has(key)) {
            continue;
          }

          const blockData = blocks.get(key);
          if (!blockData || typeof blockData.type === 'undefined') {
            console.warn(`Voxel data missing or invalid type at key: ${key}`);
            continue;
          }

          const blockType = blockData.type;

          /**@type {MeshFaces}*/
          const chunkFaces = _getOrCreateMeshFace(blockType);

          try {
            await chunkFaces.BuildMeshFacesAsync(
              this.vector3Buffer.set(x, y, z),
              blocks,
              this,
            );
          } catch (error) {
            console.log(error);
          }
        }
      }
    }

    this.blockTypeMeshFaces = this.blockTypeMeshFaces.filter((x) => x != null);
    this.blockTypeMeshFaces.forEach((mesh) => {
      mesh.FinalizeMeshFace();
    });
  }

  ToInstanceMesh() {
    return this.blockTypeMeshFaces.flatMap(
      (/** @type {MeshFaces}*/ mf) => mf.meshFacesInstace,
    );
  }

  Dispose() {
    this.coordinate = null;
    this.size = null;
    this.edge = null;
    this.LOD = null;
    this.vector3Buffer = null;
    this.blockTypeMeshFaces = null;
  }
}

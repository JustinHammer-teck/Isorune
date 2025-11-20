import MeshFaces from '@/objects/mesh_type/mesh_faces';
import { VoxelFace, BlockType } from '@/objects/blocks';
import { Terrain } from '@/objects/terrain/terrain';

export default class TransparentFaces extends MeshFaces {
  constructor(material, voxelDefinition) {
    super(material, voxelDefinition);
  }

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

      if (faceDirection === VoxelFace.LEFT && x === edge.minEdge.x) {
        return false;
      }

      if (faceDirection === VoxelFace.RIGHT && nx === edge.maxEdge.x) {
        return false;
      }

      if (faceDirection === VoxelFace.BACk && y === edge.minEdge.y) {
        return false;
      }

      if (faceDirection === VoxelFace.FRONT && ny === edge.maxEdge.y) {
        return false;
      }

      const isNeighborOutsideChunk =
        nx < edge.minEdge.x ||
        nx >= edge.maxEdge.x ||
        ny < edge.minEdge.y ||
        ny >= edge.maxEdge.y;

      if (isNeighborOutsideChunk) {
        return true;
      }

      const neighborKey = `${nx},${nz},${ny}`;
      const neighborBlock = blocks.get(neighborKey);
      const neighborBlockType = neighborBlock
        ? neighborBlock.type
        : BlockType.AIR;

      return neighborBlockType !== BlockType.WATER;
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
}

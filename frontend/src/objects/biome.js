import { BLOCkS } from '@/game_config/block';
import ThreeHelper from '@/utils/three_helper';
import Block, { VoxelFace, BlockType } from '@/objects/blocks';

/** @import { Terrain } from '@/objects/terrain/terrain'*/

export default class Biome {
  voxels = new Array(10);
  constructor() {
    this.#CreateWorldBlock();
  }

  /**
   * @param {BlockType} type
   *
   * @returns {Block}
   * */
  GetBlock(type) {
    return this.voxels[type];
  }

  #CreateWorldBlock() {
    const {
      tileSize,
      atlasWidth,
      atlasHeight,
      grass,
      water,
      dirt,
      sand,
      snow,
    } = BLOCkS;

    const CreateBlock = (type, texture) => {
      if (this.voxels[type] != null) return;

      const voxel = new Block(type);
      voxel.SetAllFacesUVCoordinate(
        ThreeHelper.GetUVFromSubTexture(
          texture,
          tileSize,
          atlasWidth,
          atlasHeight,
        ),
      );
      this.voxels[type] = voxel;
    };

    const CreateVoxelWithTop = (type, sideTexture, topTexture) => {
      if (this.voxels[type] != null) return;

      const voxel = new Block(type);
      voxel.SetUVCoordinate(
        VoxelFace.TOP,
        ThreeHelper.GetUVFromSubTexture(
          topTexture,
          tileSize,
          atlasWidth,
          atlasHeight,
        ),
      );

      voxel.SetAllFacesUVCoordinate(
        ThreeHelper.GetUVFromSubTexture(
          sideTexture,
          tileSize,
          atlasWidth,
          atlasHeight,
        ),
        [VoxelFace.TOP],
      );

      this.voxels[type] = voxel;
    };

    CreateBlock(BlockType.SAND, sand);
    CreateBlock(BlockType.SOIL, dirt);
    CreateBlock(BlockType.WATER, water);
    CreateVoxelWithTop(BlockType.GRASS, grass.side, grass.top);
    CreateVoxelWithTop(BlockType.SNOW_DIRT, snow.dirt, snow.top);
    CreateVoxelWithTop(BlockType.SNOW_ROCk, snow.rock, snow.top);
  }
}

import { Chunk } from '@/objects/terrain';
import { Noise } from '@/logics/noise';
import Biome from '@/objects/biome';
import { BlockType } from '@/objects/blocks';

import { MeshLambertMaterial, DoubleSide } from 'three';

/**
 * @namespace Terrain
 */

/** @import { Debugger } from '@/tools/debugger'*/
/** @import { Vector2 , Vector3 } from 'three'*/
/** @import { BlockTypeContainer } from '@/objects/terrain/container'*/

/**
 * @property {Map} #blocks
 * @property {Noise} heightNoise
 * @property {Map} chunks
 * @property {boolean} rendered
 * */
export class Terrain {
  #blocks = new Map();
  rendered = false;
  heightNoise;
  material;
  #chunks = new Map();

  /** @type {import('@/logics/noise').NoiseProps} noiseConfig*/
  noiseConfig = {
    octaves: 8,
    scale: 800,
    persistant: 100,
    exponentiation: 3,
    lacunarity: 150,
  };

  static TERRAIN_CHUNk_LIMIT = 160;
  static TERRAIN_CHUNk_HEIGHT = 400;
  static SEA_LEVEL = 1;
  static DEFAULT_LOD = 4;

  GetChunk(coordinate) {
    return this.#chunks.get(coordinate);
  }

  /**
   * @param {Debugger} gui
   * @param {Texture} texture
   * */
  constructor(gui, texture) {
    this.heightNoise = new Noise();

    this.material = new MeshLambertMaterial({
      wireframe: true,
      map: texture,
      side: DoubleSide,
      alphaTest: 0.1,
      flatShading: true,
    });

    this.biome = new Biome();
  }

  /**
   * @param {Chunk} chunk
   * */
  async GenerateAsync(chunk) {
    const size = chunk.LOD;

    const edge = chunk.edge;
    const minX = edge.minEdge.x - size;
    const maxX = edge.maxEdge.x + size;
    const minY = edge.minEdge.y - size;
    const maxY = edge.maxEdge.y + size;

    /**
     * @param {string} key
     * @param {BlockType} voxelType
     * */
    const updateTerrainInfo = (key, voxelType) => {
      this.#blocks.set(key, { type: voxelType });
    };

    for (let y = minY; y <= maxY; y += size) {
      for (let x = minX; x <= maxX; x += size) {
        const blockHeight = Math.floor(
          this.heightNoise.Get2D(x, y, this.noiseConfig) *
            Terrain.TERRAIN_CHUNk_HEIGHT,
        );

        // const blockHeight = 1;

        for (let z = 0; z <= blockHeight; z += size) {
          const key = `${x},${z},${y}`;
          if (this.#blocks.has(key)) continue;

          if (z < 2 * size) {
            updateTerrainInfo(key, BlockType.SOIL);
          } else if (z < 3 * size) {
            updateTerrainInfo(key, BlockType.SAND);
          } else if (z > 3) {
            updateTerrainInfo(key, BlockType.GRASS);
          }
        }

        /*
         * Create SEA
         * */
        for (let z = 0; z <= Terrain.SEA_LEVEL * size; z += size) {
          if (z > blockHeight) {
            const key = `${x},${z},${y}`;
            if (this.#blocks.has(key)) continue;
            updateTerrainInfo(key, BlockType.WATER);
          }
        }
      }
    }
  }

  /**
   * @param {Vector2} coordinate
   * @param {number} levelOfDetail
   *
   * @returns {Promise<Chunk>}
   * */
  async AppendChunkAsync(coordinate, levelOfDetail = Terrain.DEFAULT_LOD) {
    const coordinatekey = coordinate.Tokey();
    if (this.#chunks.has(coordinatekey)) {
      return this.#chunks.get(coordinatekey);
    }

    const chunk = new Chunk(
      coordinate,
      Terrain.TERRAIN_CHUNk_LIMIT,
      levelOfDetail,
    );

    await this.GenerateAsync(chunk);

    this.#chunks.set(coordinatekey, chunk);
    this.rendered = false;

    return chunk;
  }

  /**
   * @param {Chunk} chunk
   * @param {Function} addToApp
   * */
  async RenderChunks(chunk, addToApp) {
    if (this.rendered) return;

    await chunk.CreateAsync(this.#blocks, this.material, this.biome);

    chunk.ToInstanceMesh().forEach((mesh) => {
      addToApp(mesh);
    });

    this.rendered = true;
  }

  DisposeChunk(chunk) {}
}

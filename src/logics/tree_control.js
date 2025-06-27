import { Vector3 } from "three";

const MAX_TREES_PER_CHUNK_AREA = 20;
const MIN_DISTANCE_BETWEEN_TREES = 8;
const TREE_PLACEMENT_ATTEMPTS = 20;
const MAX_TREES_PER_NEW_CHUNK = 4;

export class TreeControl {
  /** @type {import('@/core/app').App} */
  app;
  placedTrees = []; // To store positions or references of placed trees
  /** @type {Set<string>} */
  placedPositions = new Set(); // To keep track of positions (x,z) more efficiently

  constructor(app) {
    this.app = app;
  }

  async initializeTrees(terrain) {
    console.log("Starting tree initialization...");

    // Preload models first
    if (this.app.treeFactory && this.app.treeFactory.preloadAllModels) {
      await this.app.treeFactory.preloadAllModels();
    } else {
      console.error(
        "TreeFactory is not available or preloadAllModels is missing."
      );
      return;
    }

    const grassBlocks = terrain.getGrassBlocksForTrees(4); // Using LOD 4, consistent with buildings

    if (!grassBlocks || grassBlocks.length === 0) {
      console.log("No suitable grass blocks found for trees.");
      return;
    }

    console.log(
      `Found ${grassBlocks.length} suitable grass blocks for potential tree placement.`
    );

    // Convert to Vector3 and adjust Y position to be on top of the grass block
    // The y in block.position is the actual height, so no major adjustment needed, maybe a small epsilon to prevent z-fighting
    const treePositions = grassBlocks.map(
      (block) =>
        new Vector3(block.position.x, block.position.y + 0.1, block.position.z) // Small offset for y
    );

    let placedCount = 0;
    const shuffledPositions = this.shuffleArray(treePositions);

    for (
      let i = 0;
      i < Math.min(shuffledPositions.length, TREE_PLACEMENT_ATTEMPTS);
      i++
    ) {
      const position = shuffledPositions[i];
      const posKey = `${position.x.toFixed(1)},${position.z.toFixed(1)}`;

      if (
        !this.isTooCloseToExistingTree(position) &&
        !this.placedPositions.has(posKey)
      ) {
        const randomTreeTypeIndex =
          this.app.treeFactory.getRandomTreeTypeIndex();
        const tree = await this.app.treeFactory.createTree(
          position,
          randomTreeTypeIndex
        );

        if (tree) {
          this.placedTrees.push(tree); // Store the tree object itself or its position
          this.placedPositions.add(posKey);
          placedCount++;
          if (placedCount >= MAX_TREES_PER_CHUNK_AREA) {
            console.log(
              `Reached maximum tree count (${MAX_TREES_PER_CHUNK_AREA}).`
            );
            break;
          }
        }
      }
    }

    console.log(`Placed ${placedCount} trees.`);
  }

  /**
   * Place a limited number of trees on a newly generated chunk.
   * @param {import('@/objects/terrain/chunk').Chunk} chunk The newly generated chunk.
   * @param {import('@/objects/terrain/terrain').Terrain} terrain The terrain object.
   */
  async placeTreesOnChunk(chunk, terrain) {
    const minX = chunk.edge.minEdge.x;
    const maxX = chunk.edge.maxEdge.x;
    const minZ = chunk.edge.minEdge.y; // In chunk.edge, y corresponds to world Z
    const maxZ = chunk.edge.maxEdge.y;

    const grassBlocksData = terrain.getGrassBlocksInChunkRegion(
      minX,
      maxX,
      minZ,
      maxZ,
      chunk.LOD
    );

    if (grassBlocksData.length === 0) {
      // console.log(
      //   `No suitable grass blocks found in new chunk (${chunk.coordinate.x},${chunk.coordinate.y}) for trees.`
      // );
      return;
    }

    const treePositions = grassBlocksData.map(
      (block) =>
        new Vector3(block.position.x, block.position.y + 0.1, block.position.z) // Small offset for y
    );

    let placedCount = 0;
    const shuffledPositions = this.shuffleArray(treePositions);

    for (const position of shuffledPositions) {
      const posKey = `${position.x.toFixed(1)},${position.z.toFixed(1)}`;

      if (
        !this.isTooCloseToExistingTree(position) &&
        !this.placedPositions.has(posKey)
      ) {
        const randomTreeTypeIndex =
          this.app.treeFactory.getRandomTreeTypeIndex();
        const tree = await this.app.treeFactory.createTree(
          position,
          randomTreeTypeIndex
        );

        if (tree) {
          this.placedTrees.push(tree);
          this.placedPositions.add(posKey);
          placedCount++;
          if (placedCount >= MAX_TREES_PER_NEW_CHUNK) {
            // console.log(
            //   `Reached MAX_TREES_PER_NEW_CHUNK (${MAX_TREES_PER_NEW_CHUNK}) for chunk (${chunk.coordinate.x},${chunk.coordinate.y}).`
            // );
            break;
          }
        }
      }
      // Optimization: if we've checked more positions than we could possibly place, stop.
      // This is a soft limit, as isTooCloseToExistingTree can make placing harder.

      if (
        shuffledPositions.indexOf(position) > MAX_TREES_PER_NEW_CHUNK * 5 &&
        placedCount < MAX_TREES_PER_NEW_CHUNK / 2
      ) {
        break;
      }
    }
    // console.log(
    //   `Placed ${placedCount} additional trees on new chunk (${chunk.coordinate.x},${chunk.coordinate.y}).`
    // );
  }

  isTooCloseToExistingTree(position) {
    const posKey = `${position.x.toFixed(1)},${position.z.toFixed(1)}`;
    if (this.placedPositions.has(posKey)) return true; // Quick check for exact spot

    for (const placedTree of this.placedTrees) {
      // Assuming placedTrees stores objects with a position property
      const treePosition = placedTree.position;
      if (position.distanceTo(treePosition) < MIN_DISTANCE_BETWEEN_TREES) {
        return true;
      }
    }

    return false;
  }

  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }

    return newArray;
  }

  // Tick method for the game loop, if needed for future tree animations or interactions
  Tick(delta) {
    // For now, trees are static
  }
}

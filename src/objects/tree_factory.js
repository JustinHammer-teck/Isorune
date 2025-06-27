import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { Group, Vector3 } from "three";

const TREE_MODELS = [
  {
    name: "tree_circle",
    obj: "src/assets/trees/tree_circle.obj",
    mtl: "src/assets/trees/tree_circle.mtl",
    scale: 1.6, // Doubled scale for larger trees
  },
  {
    name: "tree_square",
    obj: "src/assets/trees/tree_square.obj",
    mtl: "src/assets/trees/tree_square.mtl",
    scale: 1.6, // Doubled scale for larger trees
  },
  {
    name: "tree_tall",
    obj: "src/assets/trees/tree_tall.obj",
    mtl: "src/assets/trees/tree_tall.mtl",
    scale: 1.6, // Doubled scale for larger trees
  },
];

export class TreeFactory {
  /** @type {import('@/core/app').App} */
  app;
  objLoader;
  mtlLoader;
  loadedModels = new Map();

  constructor(app) {
    this.app = app;
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();
  }

  /**
   * Loads a single 3D model.
   * @param {{ name: string, obj: string, mtl: string, scale: number }} modelInfo - Information about the model to load.
   * @returns {Promise<Group>} A promise that resolves with the loaded model (Group).
   */
  async loadModel(modelInfo) {
    if (this.loadedModels.has(modelInfo.name)) {
      return Promise.resolve(this.loadedModels.get(modelInfo.name));
    }

    return new Promise((resolve, reject) => {
      this.mtlLoader.load(
        modelInfo.mtl,
        (materials) => {
          materials.preload();
          this.objLoader.setMaterials(materials);
          this.objLoader.load(
            modelInfo.obj,
            (object) => {
              object.scale.set(
                modelInfo.scale,
                modelInfo.scale,
                modelInfo.scale
              );
              object.castShadow = true;
              object.receiveShadow = true;
              object.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });
              this.loadedModels.set(modelInfo.name, object);
              resolve(object);
            },
            undefined,
            (error) => {
              console.error(`Error loading OBJ ${modelInfo.name}:`, error);
              reject(error);
            }
          );
        },
        undefined,
        (error) => {
          console.error(`Error loading MTL ${modelInfo.name}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Preloads all defined tree models.
   * @returns {Promise<void>}
   */
  async preloadAllModels() {
    const loadPromises = TREE_MODELS.map((modelInfo) =>
      this.loadModel(modelInfo)
    );
    try {
      await Promise.all(loadPromises);
      console.log("All tree models preloaded successfully.");
    } catch (error) {
      console.error("Error preloading tree models:", error);
      return Promise.reject(error); // Explicitly return a rejected promise
    }

    return Promise.resolve(); // Explicitly return a resolved promise
  }

  /**
   * Creates a tree instance at the given position.
   * @param {Vector3} position - The position to place the tree.
   * @param {number} treeTypeIndex - The index of the tree type in TREE_MODELS.
   * @returns {Promise<Group | null>} A promise that resolves with the created tree Group or null if failed.
   */
  async createTree(position, treeTypeIndex) {
    if (treeTypeIndex < 0 || treeTypeIndex >= TREE_MODELS.length) {
      console.error("Invalid treeTypeIndex:", treeTypeIndex);
      treeTypeIndex = 0; // Default to the first tree type
    }

    const modelInfo = TREE_MODELS[treeTypeIndex];
    let modelTemplate;

    if (this.loadedModels.has(modelInfo.name)) {
      modelTemplate = this.loadedModels.get(modelInfo.name);
    } else {
      console.warn(
        `Tree model ${modelInfo.name} not preloaded. Loading now...`
      );
      try {
        modelTemplate = await this.loadModel(modelInfo);
      } catch (error) {
        console.error(`Failed to load tree model ${modelInfo.name}:`, error);
        return null; // Or handle error appropriately
      }
    }

    if (!modelTemplate) {
      console.error(`Model template for ${modelInfo.name} is null.`);
      return null;
    }

    const treeObject = modelTemplate.clone();
    treeObject.position.copy(position);

    // Add a slight random rotation for variety
    treeObject.rotation.y = Math.random() * Math.PI * 2;

    const treeContainer = new Group(); // Use a Group to potentially add more elements later (e.g. collision box)
    treeContainer.add(treeObject);
    treeContainer.name = `Tree_${modelInfo.name}`;

    // The App class should handle adding to scene and loop
    this.app.AddObject(treeContainer);
    // Trees are static, so usually don't need to be added to the update loop unless they have animations
    // this.app.AddToLoop(treeContainer); // Uncomment if trees need updates

    return treeContainer;
  }

  getRandomTreeTypeIndex() {
    return Math.floor(Math.random() * TREE_MODELS.length);
  }
}

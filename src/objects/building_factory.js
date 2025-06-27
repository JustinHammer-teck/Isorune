import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { Group, Mesh } from "three";

// Define the building types with correct folder and file names
export const BUILDING_TYPES = [
  {
    name: "Small Building 1",
    folder: "Small Building 1",
    objName: "SmallBuilding01",
    scale: 4.0,
  },
  {
    name: "Small Building 2",
    folder: "Small Building 2",
    objName: "SmallBuilding02",
    scale: 4.0,
  },
  {
    name: "Tall Building 1",
    folder: "Tall Building 1",
    objName: "TallBuilding01",
    scale: 6.0,
  },
  {
    name: "Tall Building 2",
    folder: "Tall Building 2",
    objName: "TallBuilding02",
    scale: 6.0,
  },
  {
    name: "Tiny Building 1",
    folder: "Tiny Building 1",
    objName: "TinyBuilding01",
    scale: 3.0,
  },
];

export class BuildingFactory {
  constructor(app) {
    this.app = app;
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();
    this.buildings = [];
  }

  /**
   * Create a building at the specified position
   * @param {Vector3} position The position to place the building
   */
  createBuilding(position) {
    // Randomly select a building type
    const buildingTypeIndex = Math.floor(Math.random() * BUILDING_TYPES.length);
    const buildingType = BUILDING_TYPES[buildingTypeIndex];

    console.log(
      `Creating building: ${buildingType.name} at position (${position.x}, ${position.y}, ${position.z})`
    );

    // Setup paths
    const folderPath = `src/assets/buildings/${buildingType.folder}/`;
    const objFile = `${buildingType.objName}.obj`;
    const mtlFile = `${buildingType.objName}.mtl`;

    console.log(`Loading building from folder: ${folderPath}`);
    console.log(`OBJ file: ${objFile}, MTL file: ${mtlFile}`);

    // Load materials first, then load object
    this.mtlLoader.setPath(folderPath);
    console.log(`Loading MTL from: ${folderPath}${mtlFile}`);

    this.mtlLoader.load(
      mtlFile,
      // MTL loaded successfully
      (materials) => {
        console.log(`Materials loaded successfully for ${mtlFile}`);
        materials.preload();

        this.objLoader.setMaterials(materials);
        this.objLoader.setPath(folderPath);

        console.log(`Loading OBJ from: ${folderPath}${objFile}`);
        this.objLoader.load(
          objFile,
          // OBJ loaded successfully
          (object) => {
            console.log(`OBJ loaded successfully: ${objFile}`);

            // Create a container for the model
            const model = new Group();
            model.add(object);

            // Set position
            model.position.copy(position);

            // Apply scale
            const scale = buildingType.scale;
            model.scale.set(scale, scale, scale);
            console.log(`Applied scale: ${scale} to building`);

            // Apply random rotation for variety
            model.rotation.y = Math.random() * Math.PI * 2;

            // Make the buildings cast and receive shadows
            model.traverse(function (child) {
              if (child instanceof Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.geometry.computeBoundingBox();
              }
            });

            // Add Tick method (empty since buildings don't need to be updated)
            model.Tick = (delta) => {};

            // Add to scene and game loop
            this.app.scene.add(model);
            this.app.AddObject(model); // Add to app's objects
            this.app.AddToLoop(model); // Add to game loop

            console.log(
              `Added ${buildingType.name} to scene at position (${position.x}, ${position.y}, ${position.z})`
            );

            // Store for reference
            this.buildings.push(model);

            // Ensure building controller also tracks this building
            if (this.app.buildingCtrl) {
              this.app.buildingCtrl.buildings.push(model);
            }
          },
          // OBJ loading progress
          (progress) => {
            if (progress.lengthComputable) {
              const percentage = (progress.loaded / progress.total) * 100;
              console.log(`OBJ loading progress: ${percentage.toFixed(2)}%`);
            }
          },
          // OBJ loading error
          (error) => {
            console.error(`Error loading OBJ ${objFile}:`, error);
          }
        );
      },
      // MTL loading progress
      (progress) => {
        if (progress.lengthComputable) {
          const percentage = (progress.loaded / progress.total) * 100;
          console.log(`MTL loading progress: ${percentage.toFixed(2)}%`);
        }
      },
      // MTL loading error
      (error) => {
        console.error(`Error loading MTL ${mtlFile}:`, error);
      }
    );
  }
}

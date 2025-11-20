const { Matrix4 } = require('three');
const { default: MeshFaces } = require('../mesh_type/mesh_faces');
const { Terrain } = require('./terrain');

onmessage = (e) => {
  console.log('Worker: Message received from main script');
  { vector3Buffer, blocks, LOD, chunkEdge, biome, }
  const voxelSize = this.LOD;
  const maxtrix = new Matrix4();
  //NOTE: We don't have to render the faces that is at the edge of the chunk

  for (let y = this.edge.minEdge.y; y < this.edge.maxEdge.y; y += voxelSize) {
    for (let x = this.edge.minEdge.x; x < this.edge.maxEdge.x; x += voxelSize) {
      for (let z = 0; z <= Terrain.TERRAIN_CHUNk_HEIGHT; z += voxelSize) {
        const key = `${x},${z},${y}`;
        if (!blocks.has(key)) continue;
        const blockType = blocks.get(key).type;
        /**@type {MeshFaces}*/
        const chunkFaces = this.meshFaces[blockType];

        chunkFaces.BuildMeshFacesAsync(
          this.vector3Buffer.set(x, y, z),
          e.data.blocks,
          voxelSize,
          this.edge,
          this.manager.GetVoxel(blockType),
          e.data.material,
          maxtrix,
        );
      }
    }
  }

  this.meshFaces = this.meshFaces.filter((x) => x != null);
  this.meshes = this.meshFaces.flatMap(
    (/** @type {MeshFaces}*/ mf) => mf.meshFacesInstace,
  );
};

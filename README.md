# ✈️ SkyBreaker – 3D Fighter Jet Game (Three.js)

SkyBreaker is a web-based 3D arcade-style flight combat game developed using Three.js. It combines procedural terrain generation, realistic flight controls, and dynamic enemy encounters to create an immersive dogfighting experience in the browser.

<p align="center">
  <img src="https://github.com/user-attachments/assets/08c0de26-1a27-4151-91ad-d63955c79566" width="800"/>
</p>

## 🧩 Features

### 🎮 Gameplay

- Engage in air combat against enemy jets  
- Navigate procedurally generated terrain and environments  
- Complete missions and survive waves of threats  

<p align="center">
  <img src="https://github.com/user-attachments/assets/8d3d1839-b417-4cf9-b8f0-0cc7b331d7f8" width="400"/>
</p>

### ✈️ Jet Mechanics

- Full 3D flight control with pitch, yaw, roll, and turbo boost  
- Dynamic speed control and flight physics  
- Machine gun shooting with collision-based hitpoint reduction and explosion effects  
- Planned expansion: bombs and guided missile systems  

<p align="center">
  <img src="https://github.com/user-attachments/assets/fc178e5c-bea7-432b-8465-f10de03ad475" width="400"/>
</p>

### 🗺️ Procedural Terrain & Biomes

- Infinite terrain generation using simplex noise  
- Biome-based terrain styling integrated with terrain logic  
- Memory-optimized voxel block rendering with face-level instancing  
- Terrain rendering optimized using async loading and draw call reduction  
- Planned chunk generation via Web Workers for non-blocking performance  

<p align="center">
  <img src="https://github.com/user-attachments/assets/510290fe-f41b-4542-872e-cfc5f20ee5fd" width="400"/>
</p>

## 🛠️ Technologies

- Three.js – WebGL 3D rendering  
- OBJLoader & MTLLoader – Model and material loading  
- Simplex Noise – Procedural heightmap generation  
- InstanceMesh – Optimized rendering of voxel terrain  
- JavaScript (ES6) – Core game logic and UI  
- Custom collision detection – No external physics engine  

## 📁 Project Structure

```bash
assets/
fonts/
src/
├── assets/
├── core/
├── game_config/
├── logics/
├── objects/
├── tools/
├── utils/
styles/
```

## 🙏 Credits

Special thanks to the following creators for their high-quality asset contributions:

- [Max Parata](https://maxparata.itch.io/voxel-plane) – Voxel plane models
- [AurynSky](https://aurynsky.itch.io/rockets-bombs-and-missiles-pack-3d-assets) – Missile models
- [MsRanaApps](https://msrana.itch.io/explosion-pack-2in1) – Explosion effects

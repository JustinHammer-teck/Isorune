import { Color, PointLight } from 'three';

export class Sun {
  constructor() {
    const light = new PointLight(
      new Color('#FFCB8E').convertSRGBToLinear().convertSRGBToLinear(),
      2,
      200,
    );

    light.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;

    this.light = light;
  }
}

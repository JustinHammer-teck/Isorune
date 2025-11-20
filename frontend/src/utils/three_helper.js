export default class ThreeHelper {
  static GetUVFromSubTexture(texture, tileSize, atlasWidth, atlasHeight) {
    const { x, y } = texture;

    const padding = 1;

    const u0 = (x + padding) / atlasWidth;
    const v0 = 1 - (y + tileSize - padding) / atlasHeight;
    const u1 = (x + tileSize - padding) / atlasWidth;
    const v1 = 1 - (y + padding) / atlasHeight;

    return new Float32Array([
      u0,
      v1, // bottom-left
      u1,
      v1, // bottom-right
      u1,
      v0, // top-right
      u0,
      v0, // top-left
    ]);
  }
}

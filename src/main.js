import { App } from '@/core/app';

//  NOTE: set mesh.matrixAutoUpdate = false for static assets in the scene to boost performance

(async () => {
  const app = new App();
  await app.InitAsync(); // defensive constructor to control async init function
  await app.StartAsync();
})();

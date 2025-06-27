import { App } from "@/core/app";

//  NOTE: set mesh.matrixAutoUpdate = false for static assets in the scene to boost performance

(async () => {
  const app = App.instance;
  const params = new URLSearchParams(window.location.search);
  const playerNum = params.get('player');
  app.setPlayerNum(playerNum);
  await app.InitAsync(); // defensive constructor to control async init function
  await app.StartAsync();
})();

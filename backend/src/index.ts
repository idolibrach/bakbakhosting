import { getServers, startDatabase } from "./db";
import { getPaperVersions } from "./paperAPI";
import { setupServer } from "./serverManager";
import { startWebServer } from "./web";

export let paperVersions: string[] = [];

async function start() {
  startDatabase();
  paperVersions = await getPaperVersions();
  if (paperVersions.length === 0) {
    console.error("Failed to fetch Paper versions.");
    throw new Error("No Paper versions found");
  } else {
    console.log("Fetched Paper versions");
  }

  startWebServer(5000);

  // await addServer("testServer2", "Test2 Server", paperVersions[23]);
  // console.log(await getServers());
  // await setupServer("test", "Test Server", "1.21.7", (progress, message) => {
  //   console.log(`Progress: ${progress}%`, message ? `Message: ${message}` : "");
  // });
}

start();

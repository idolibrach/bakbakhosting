import { paperVersions } from ".";
import { addServer, getNextPort, getServer, ServerInfo } from "./db";
import { getPaperBuildInfo } from "./paperAPI";
import { Downloader } from "nodejs-file-downloader";
import { ChildProcess, spawn } from "child_process";
import fs from "fs";
import { Socket } from "socket.io";
import path from "path";

export const activeServers: { [id: string]: ActiveServer } = {};

type ActiveServer = {
  info: ServerInfo;
  process: ChildProcess | null;
  logs: string[];
  subscribers: Socket[];
};

export async function updateFile(
  id: string,
  innerPath: string[],
  data: string
) {
  await fs.promises.writeFile(
    path.join(process.cwd(), "servers", id, ...innerPath),
    data,
    "utf-8"
  );
}

export async function getFile(id: string, innerPath: string[]) {
  return await fs.promises.readFile(
    path.join(process.cwd(), "servers", id, ...innerPath),
    "utf-8"
  );
}

export async function listFiles(id: string, innerPath: string[]) {
  const cwd = process.cwd();
  try {
    const dirPath = path.join(cwd, "servers", id, ...innerPath);
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    const folders: string[] = [];
    const files: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        folders.push(entry.name);
      } else {
        files.push(entry.name);
      }
    }

    // Sort alphabetically
    folders.sort((a, b) => a.localeCompare(b));
    files.sort((a, b) => a.localeCompare(b));

    // Return folders first, then files
    return [...folders, ...files];
  } catch (err) {
    console.error("Error reading directory:", err);
    return [];
  }
}

export async function loadServer(id: string) {
  const serverInfo = await getServer(id);
  if (!serverInfo) {
    return;
  }
  activeServers[id] = {
    info: serverInfo,
    process: null,
    logs: [],
    subscribers: [],
  };
}

export async function startServer(id: string) {
  const serverInfo = await getServer(id);
  if (!serverInfo) {
    throw new Error(`Server with ID "${id}" not found.`);
  }

  const cwd = process.cwd();

  const javaPath = path.join(cwd, "jdk", "bin", "java");
  const jarPath = path.join(cwd, "servers", id, "server.jar");
  const cwdPath = path.join(cwd, "servers", id);

  const server = spawn(
    javaPath,
    ["-Xmx" + serverInfo.ram + "G", "-jar", jarPath, "--nogui"],
    {
      cwd: cwdPath,
    }
  );

  if (!activeServers[id]) {
    activeServers[id] = {
      info: serverInfo,
      process: server,
      logs: [],
      subscribers: [],
    };
  } else {
    activeServers[id].process = server;
  }

  for (const socket of activeServers[id].subscribers) {
    socket.emit("info", {
      info: serverInfo,
      active: true,
      online: true,
    });
  }

  server.on("close", (code) => {
    activeServers[id].logs.push(`Server exited with code ${code}`);
    activeServers[id].process = null;
    for (const socket of activeServers[id].subscribers) {
      socket.emit("info", {
        info: serverInfo,
        active: true,
        online: false,
      });
    }
  });

  server.stdout.on("data", (data) => {
    let s = data
      .toString()
      .replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ""
      );
    for (const line of s.split("\n")) {
      activeServers[id].logs.push(line);
      activeServers[id].subscribers.forEach((socket) => {
        if (!socket.connected) return;
        socket.emit("serverLog", line);
      });
      if (activeServers[id].logs.length > 100) {
        activeServers[id].logs.shift(); // Keep logs to last 100 lines
      }
    }
  });
}

export async function setupServer(
  id: string,
  name: string,
  version: string,
  ram: number,
  progress?: (progress: number, message?: string) => any
) {
  if (!paperVersions.includes(version)) {
    throw new Error(`Version ${version} is not a valid Paper version.`);
  }

  if (!isValidId(id)) {
    throw new Error(`Server ID "${id}" is not valid.`);
  }

  progress?.(0, `Registering server...`);

  await addServer(id, name, version, ram);
  console.log(`Server ${name} with ID ${id} added successfully.`);

  // now actually setup!
  progress?.(0, `Getting build info...`);
  const buildInfo = await getPaperBuildInfo(version);
  if (!buildInfo) {
    throw new Error(`Failed to fetch build info for version ${version}.`);
  }

  progress?.(0, `Downloading server jar...`);
  const downloader = new Downloader({
    url: buildInfo.link,
    fileName: "server.jar",
    directory: "./servers/" + id, //Sub directories will also be automatically created if they do not exist.
    onProgress: function (percentage, chunk, remainingSize) {
      progress?.(Number(percentage) / 100);
    },
  });

  await downloader.download();

  progress?.(1, `Finishing up...`);
  const eulaPath = "./servers/" + id + "/eula.txt";
  await fs.promises.writeFile(eulaPath, "eula=true");

  const port = await getNextPort();
  await fs.promises.writeFile(
    "./servers/" + id + "/server.properties",
    "server-port=" + port
  );

  progress?.(1, `Server setup complete!`);
}

function isValidId(id: string) {
  const regex = /^[a-z0-9]+$/;
  return regex.test(id);
}

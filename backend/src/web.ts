import express from "express";
import http from "http";
import { Server } from "socket.io";
import {
  activeServers,
  getFile,
  listFiles,
  loadServer,
  setupServer,
  startServer,
  updateFile,
} from "./serverManager";
import { getServer, getServers, ServerInfo } from "./db";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.text());
app.post("/api/saveFile", async (req, res) => {
  const id = req.query.id as string;
  const path = (req.query.path as string).split(",");
  await updateFile(id, path, req.body);
  res.json({});
});

app.get("/api/files", async (req, res) => {
  const id = req.query.id as string;
  const path = (req.query.path as string).split(",");
  if ((req.query.path as string).includes(".")) {
    res.json(await getFile(id, path));
    return;
  }
  res.json(await listFiles(id, path));
});

app.get("/api/servers", async (req, res) => {
  const servers: {
    active: ServerInfo[];
    inactive: ServerInfo[];
  } = {
    active: [],
    inactive: [],
  };

  for (const id in activeServers) {
    const serverInfo = activeServers[id].info;
    if (activeServers[id].process) {
      servers.active.push(serverInfo);
    } else {
      servers.inactive.push(serverInfo);
    }
  }

  const rest = await getServers();
  for (const serverInfo of rest) {
    if (
      !servers.active.some((s) => s.id === serverInfo.id) &&
      !servers.inactive.some((s) => s.id === serverInfo.id)
    ) {
      servers.inactive.push(serverInfo);
    }
  }

  res.json(servers);
});

io.on("connection", async (socket) => {
  if (socket.handshake.query.mode === "newserver") {
    const data = JSON.parse(socket.handshake.query.data! as string);
    await setupServer(
      data.id,
      data.name,
      data.version,
      data.ram,
      (progress, message) => {
        socket.emit("progress", {
          progress,
          message,
        });
      }
    );
    await startServer(data.id);
    socket.emit("startingServer", data.id);
    socket.disconnect();
  } else if (socket.handshake.query.mode === "server") {
    const data = JSON.parse(socket.handshake.query.data! as string);
    const id = data.id;
    let info: ServerInfo | null;
    if (activeServers[id]) {
      info = activeServers[id].info;
      activeServers[id].subscribers.push(socket);
      // socket.emit("logs", activeServers[id].logs);
    } else {
      info = await getServer(id);
    }
    if (!info) {
      socket.disconnect();
      return;
    }

    socket.emit("info", {
      info: info,
      active: activeServers[id] ? true : false,
      online: activeServers[id] && activeServers[id].process ? true : false,
    });

    socket.on("logs", () => {
      if (!activeServers[id]) return;
      socket.emit("logs", activeServers[id].logs);
    });

    socket.on("load", async () => {
      await loadServer(id);
      activeServers[id].subscribers.push(socket);
      socket.emit("info", {
        info: info,
        active: activeServers[id] ? true : false,
        online: activeServers[id] && activeServers[id].process ? true : false,
      });
    });

    socket.on("message", (msg) => {
      if (!activeServers[id]) return;
      if (!activeServers[id].process) return;
      activeServers[id].process.stdin!.write(msg + "\n");
    });

    socket.on("startServer", () => {
      startServer(id);
    });
  } else {
    socket.disconnect();
  }
});

export function startWebServer(port: number) {
  server.listen(port, () => {
    console.log("listening on *:" + port);
  });
}

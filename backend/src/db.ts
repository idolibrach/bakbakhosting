import { Database } from "sqlite3";
import { serialize } from "v8";

const sqlite3 = require("sqlite3").verbose();

let db: Database | null = null;

export type ServerInfo = {
  id: string;
  name: string;
  version: string;
  ram: number;
};

export function getNextPort() {
  return new Promise((resolve, reject) => {
    db!.all("SELECT * FROM general", [], (err: Error, rows: any[]) => {
      if (err) {
        console.error("Error fetching servers:", err.message);
        return reject(err);
      }
      resolve(rows[0].nextPort);

      db!.run(
        `UPDATE general SET nextPort = ? WHERE id = 1`,
        [rows[0].nextPort + 1],
        (err) => {
          if (err) {
            console.error("Error fetching servers:", err.message);
          }
        }
      );
    });
  });
}

export function startDatabase() {
  db = new sqlite3.Database(
    "./data.db",
    sqlite3.OPEN_READWRITE,
    (err: Error) => {
      if (err) return console.error("Error opening database:", err.message);
      console.log("Connected to the database");
    }
  ) as Database;

  // create table
  db.serialize(() => {
    db!.run(`CREATE TABLE IF NOT EXISTS servers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(10) NOT NULL,
    ram INTEGER DEFAULT 2
  )`);

    db!.run(`CREATE TABLE IF NOT EXISTS general (
    id INTEGER PRIMARY KEY,
    nextPort INTEGER NOT NULL
  )`);

    db!.run(
      "INSERT OR IGNORE INTO general (id, nextPort) VALUES (?, ?)",
      [1, 25565],
      function (err: Error) {
        if (err) {
          console.error("Error:", err.message);
        }
      }
    );
  });
}

export function getServers(): Promise<ServerInfo[]> {
  return new Promise((resolve, reject) => {
    db!.all("SELECT * FROM servers", [], (err: Error, rows: any[]) => {
      if (err) {
        console.error("Error fetching servers:", err.message);
        return reject(err);
      }
      return resolve(rows);
    });
  });
}

export function getServer(id: string): Promise<ServerInfo | null> {
  return new Promise((resolve, reject) => {
    db!.get(
      "SELECT * FROM servers WHERE id = ?",
      [id],
      (err: Error, row: any) => {
        if (err) {
          console.error("Error fetching server:", err.message);
          return reject(err);
        }
        if (!row) {
          return resolve(null);
        }
        return resolve(row);
      }
    );
  });
}

export function addServer(
  id: string,
  name: string,
  version: string,
  ram: number = 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ram < 1 || ram > 6) {
      return reject(new Error("RAM must be between 1 and 6 GB"));
    }

    db!.run(
      "INSERT INTO servers (id, name, version, ram) VALUES (?, ?, ?, ?)",
      [id, name, version, ram],
      function (err: Error) {
        if (err) {
          console.error("Error adding server:", err.message);
          return reject(err);
        }
        console.log(`Server added with ID: ${id}`);
        return resolve();
      }
    );
  });
}

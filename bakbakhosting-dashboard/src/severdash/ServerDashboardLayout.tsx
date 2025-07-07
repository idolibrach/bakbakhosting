import { createContext, useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router";
import { io, Socket } from "socket.io-client";
import type { ServerInfo } from "../myservers/MyServers";

export const ServerContext = createContext<null | {
  info: {
    info: ServerInfo;
    active: boolean;
  } | null;
  socket: Socket | null;
}>(null);

const ServerDashboardLayout = () => {
  const { id } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [info, setInfo] = useState<null | {
    info: ServerInfo;
    active: boolean;
    online: boolean;
  }>(null);

  useEffect(() => {
    const connect = async () => {
      const socket = io(import.meta.env.VITE_SERVER_URL, {
        query: {
          mode: "server",
          data: JSON.stringify({
            id,
          }),
        },
      });
      setSocket(socket);

      socket.on("info", (data) => {
        setInfo(data);
      });
    };

    connect();
  }, []);

  return (
    <div className="h-full p-8 flex flex-col">
      <div className="flex mb-2 items-center">
        <Link
          to={`/`}
          className={`mr-4 bg-slate-800/40 border border-slate-700 hover:border-slate-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:bg-slate-800/60 flex items-center gap-2 backdrop-blur-sm`}
        >
          Servers
        </Link>
        <h1 className="text-2xl font-bold">{info && info.info.name}</h1>
      </div>
      <div className="h-full overflow-hidden w-full bg-slate-800/40 rounded-3xl drop-shadow-xl drop-shadow-black border-slate-800 border-[1px] flex flex-col backdrop-blur-sm p-8">
        <div className="flex gap-4 mb-4">
          <NavbarItem id={id!} link="" text="Status" />
          {info && info.active ? (
            <>
              <NavbarItem id={id!} link="/console" text="Console" />
              <NavbarItem id={id!} link="/files" text="File Manager" />
              <NavbarItem id={id!} link="/settings" text="Settings" />{" "}
              <div className="flex-1"></div>
              <button
                onClick={() => {
                  if (info.online) {
                    // stop
                    socket?.emit("message", "stop");
                  } else {
                    // start
                    socket?.emit("startServer");
                  }
                }}
                className={`${
                  info.online
                    ? "bg-red-800/40 border-red-700 hover:bg-red-800/60 hover:border-red-600"
                    : "bg-green-800/40 border-green-700 hover:bg-green-800/60 hover:border-green-600"
                } border text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 backdrop-blur-sm`}
              >
                {info.online ? "Stop" : "Start"}
              </button>
            </>
          ) : null}
        </div>
        <ServerContext.Provider
          value={{
            info: info,
            socket: socket,
          }}
        >
          <Outlet />
        </ServerContext.Provider>
      </div>
    </div>
  );
};

const NavbarItem = ({
  id,
  link,
  text,
}: {
  link: string;
  text: string;
  id: string;
}) => {
  return (
    <Link
      to={`/server/${id}${link}`}
      className={`bg-slate-800/40 border ${
        (
          link === ""
            ? window.location.pathname === `/server/${id}`
            : window.location.pathname.endsWith(link)
        )
          ? "border-orange-400 hover:border-orange-500"
          : "border-slate-700 hover:border-slate-600"
      } text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:bg-slate-800/60 flex items-center gap-2 backdrop-blur-sm`}
    >
      {text}
    </Link>
  );
};

export default ServerDashboardLayout;

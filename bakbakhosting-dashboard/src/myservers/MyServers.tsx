import { useEffect, useState } from "react";
import { Link } from "react-router";

export type ServerInfo = {
  id: string;
  name: string;
  version: string;
  ram: number;
};

const MyServers = () => {
  const [servers, setServers] = useState<{
    active: ServerInfo[];
    inactive: ServerInfo[];
  }>({
    active: [],
    inactive: [],
  });

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_SERVER_URL + "/api/servers"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch servers");
        }
        const data = await response.json();
        setServers(data);
      } catch (error) {
        console.error("Error fetching servers:", error);
      }
    };

    fetchServers();
  }, []);

  const ServerCard = ({
    server,
    isActive,
  }: {
    server: ServerInfo;
    isActive: boolean;
  }) => (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700 p-4 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:border-slate-600">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <h3 className="text-lg font-semibold text-white">{server.name}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <span className="text-slate-300">{server.version}</span>
            <span className="text-slate-300">{server.ram}GB RAM</span>
            <span className="text-slate-400 font-mono text-xs">
              {server.id}
            </span>
          </div>
        </div>

        <Link
          to={`/server/${server.id}`}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          Manage
        </Link>
      </div>
    </div>
  );

  return (
    <div className="h-full flex items-center justify-center relative p-8">
      <div className="bg-slate-800/40 size-[700px] rounded-3xl drop-shadow-xl drop-shadow-black border-slate-800 border-[1px] flex flex-col backdrop-blur-sm p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1"></div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">Servers</h1>
              <p className="text-slate-300">Manage all available servers</p>
            </div>
            <div className="flex-1 flex justify-end">
              <Link
                to="/newserver"
                className="bg-slate-800/40 border border-slate-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-slate-600 flex items-center gap-2 backdrop-blur-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Server
              </Link>
            </div>
          </div>
        </div>

        {servers.active.length === 0 && servers.inactive.length === 0 ? (
          <div className="text-center text-slate-300 h-full flex flex-col items-center justify-center">
            <p className="text-lg">No servers available.</p>
            <p className="text-sm">Create a new server to get started.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 min-h-0">
            <div className="space-y-8">
              {servers.active.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Active Servers
                  </h2>
                  <div className="space-y-4">
                    {servers.active.map((server) => (
                      <ServerCard
                        key={server.id}
                        server={server}
                        isActive={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {servers.inactive.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Inactive Servers
                  </h2>
                  <div className="space-y-4">
                    {servers.inactive.map((server) => (
                      <ServerCard
                        key={server.id}
                        server={server}
                        isActive={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServers;

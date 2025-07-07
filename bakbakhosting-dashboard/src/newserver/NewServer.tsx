import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface FormData {
  serverId: string;
  serverName: string;
  version: string;
  ram: number;
}

async function getPaperVersions() {
  const res = await fetch("https://fill.papermc.io/v3/projects/paper/versions");
  if (!res.ok) return [];
  const versions = await res.json();
  return versions.versions.map((v: any) => v.version.id);
}

type FormField = "serverId" | "serverName" | "version" | "ram";

const NewServer: React.FC = () => {
  const [versions, setVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [percent, setPercent] = useState<number>(0);

  useEffect(() => {
    const fetchVersions = async () => {
      const res = await getPaperVersions();
      if (res.length === 0) {
        console.error("Failed to fetch Paper versions.");
      } else {
        setVersions(res);
        console.log("Fetched Paper versions:", res);
      }
    };

    fetchVersions();
  }, []);

  const [formData, setFormData] = useState<FormData>({
    serverId: "",
    serverName: "",
    version: "",
    ram: 2,
  });

  const [focusedField, setFocusedField] = useState<FormField | null>(null);

  const handleInputChange = (
    field: keyof FormData,
    value: string | number
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    console.log("Server creation data:", formData);
    if (
      formData.serverId === "" ||
      formData.serverName === "" ||
      formData.version === ""
    ) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);
    // Handle form submission here
    const socket = io(import.meta.env.VITE_SERVER_URL, {
      query: {
        mode: "newserver",
        data: JSON.stringify({
          id: formData.serverId,
          name: formData.serverName,
          version: formData.version,
          ram: formData.ram,
        }),
      },
    });

    socket.on("progress", (d) => {
      setPercent(d.progress);
      if (d.message) {
        setMessage(d.message);
      }
    });

    socket.on("startingServer", (id) => {
      window.location.href = `/server/${id}`;
    });
    console.log(import.meta.env.VITE_SERVER_URL);
  };

  return (
    <div className="h-full flex items-center justify-center relative">
      <div className="bg-slate-800/40 size-[700px] rounded-3xl drop-shadow-xl drop-shadow-black border-slate-800 border-[1px] flex flex-col backdrop-blur-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">New Server</h1>
          <p className="text-slate-300">Configure your new server instance</p>
        </div>

        <div className="flex-1 flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200 uppercase tracking-wide">
                Server ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.serverId}
                  onChange={(e) =>
                    handleInputChange(
                      "serverId",
                      e.target.value.replaceAll(" ", "").toLowerCase()
                    )
                  }
                  onFocus={() => setFocusedField("serverId")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm text-white placeholder-slate-400 transition-colors duration-200 ease-in-out focus:outline-none ${
                    focusedField === "serverId"
                      ? "border-blue-500 bg-slate-700/70"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  placeholder="srv-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200 uppercase tracking-wide">
                Server Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.serverName}
                  onChange={(e) =>
                    handleInputChange("serverName", e.target.value)
                  }
                  onFocus={() => setFocusedField("serverName")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm text-white placeholder-slate-400 transition-colors duration-200 ease-in-out focus:outline-none ${
                    focusedField === "serverName"
                      ? "border-blue-500 bg-slate-700/70"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                  placeholder="My Production Server"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200 uppercase tracking-wide">
              Version
            </label>
            <div className="relative">
              <select
                value={formData.version}
                onChange={(e) => handleInputChange("version", e.target.value)}
                onFocus={() => setFocusedField("version")}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm text-white transition-colors duration-200 ease-in-out appearance-none cursor-pointer focus:outline-none ${
                  focusedField === "version"
                    ? "border-blue-500 bg-slate-700/70"
                    : "border-slate-600 hover:border-slate-500"
                }`}
              >
                <option value="">Select version</option>
                {versions.map((version) => (
                  <option value={version} key={version}>
                    Minecraft {version}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-200 uppercase tracking-wide">
              RAM Allocation
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">1 GB</span>
                <span className="text-slate-300">6 GB</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={formData.ram}
                  onChange={(e) =>
                    handleInputChange("ram", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                      ((formData.ram - 1) / 5) * 100
                    }%, #475569 ${
                      ((formData.ram - 1) / 5) * 100
                    }%, #475569 100%)`,
                  }}
                />
              </div>
              <div className="text-center">
                <span className="inline-block bg-slate-700/70 px-4 py-2 rounded-full text-white font-semibold">
                  {formData.ram} GB
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full cursor-pointer py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              Create Server
            </button>
          </div>
        </div>
      </div>
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex flex-col items-center justify-center">
          <h1 className="font-bold text-2xl mb-4">
            {message === "" ? "Loading..." : message}
          </h1>
          {/* <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div> */}
          <div className="w-[500px] overflow-hidden h-7 rounded-full bg-slate-800/30 drop-shadow-md drop-shadow-black border-slate-800 border-[1px] backdrop-blur-[2px]">
            <div
              className="h-full bg-blue-600/80 backdrop-blur-[2px] rounded-full"
              style={{
                width: `${percent * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewServer;

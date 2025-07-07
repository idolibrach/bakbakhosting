import { useContext } from "react";
import { ServerContext } from "./ServerDashboardLayout";

const Home = () => {
  const { info, socket } = useContext(ServerContext)!;

  if (!info) return null;

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <div>
          <div className=" text-sm font-semibold text-slate-200 uppercase tracking-wide">
            Server ID
          </div>
          <div>{info.info.id}</div>
        </div>
        <div>
          <div className=" text-sm font-semibold text-slate-200 uppercase tracking-wide">
            Server Name
          </div>
          <div>{info.info.name}</div>
        </div>
        <div>
          <div className=" text-sm font-semibold text-slate-200 uppercase tracking-wide">
            Server Version
          </div>
          <div>{info.info.version}</div>
        </div>
        <div>
          <div className=" text-sm font-semibold text-slate-200 uppercase tracking-wide">
            Allocated RAM
          </div>
          <div>{info.info.ram} GB</div>
        </div>
      </div>
      {info.active ? null : (
        <div>
          <h1 className="text-xl font-bold">
            Your server is currently unloaded.
          </h1>
          <button
            className="bg-orange-400 px-3 py-1 rounded-lg drop-shadow drop-shadow-slate-800 mt-2 text-xl font-bold cursor-pointer"
            onClick={() => {
              socket?.emit("load");
            }}
          >
            Load Server
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;

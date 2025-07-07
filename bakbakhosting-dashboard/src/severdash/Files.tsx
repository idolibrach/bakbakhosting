import { useContext, useEffect, useState } from "react";
import { ServerContext } from "./ServerDashboardLayout";

const File = ({ file, onClick }: { file: string; onClick: any }) => {
  const isFolder = !file.includes(".");

  return (
    <div
      className="bg-slate-800/40 rounded-2xl border border-slate-700 px-4 py-3 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:border-slate-600 cursor-pointer flex items-center"
      onClick={onClick}
    >
      <div
        className={`material-symbols-outlined mr-2 ${
          isFolder ? "text-blue-500" : "text-amber-400"
        }`}
      >
        {isFolder ? "folder" : "draft"}
      </div>
      {file}
    </div>
  );
};

const Files = () => {
  const { info } = useContext(ServerContext)!;
  const [path, setPath] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [fileData, setFileData] = useState<null | string>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!info) return;
      try {
        const response = await fetch(
          import.meta.env.VITE_SERVER_URL +
            `/api/files?id=${info.info.id}&path=${path.join(",")}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch servers");
        }
        const data = await response.json();
        if (path.length > 0 && path[path.length - 1].includes(".")) {
          console.log(data);
          setFileData(data);
        } else {
          setFiles(data);
        }
      } catch (error) {
        console.error("Error fetching servers:", error);
      }
    };

    fetchFiles();
  }, [info, path]);
  return (
    <div className="overflow-y-auto w-full h-full">
      {path.length > 0 && (
        <div className="flex items-center">
          <button
            onClick={() => {
              setFileData(null);
              setPath((o) => {
                const ol = [...o];
                ol.pop();
                return ol;
              });
            }}
            className={`mr-4 bg-slate-800/40 border border-slate-700 hover:border-slate-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:bg-slate-800/60 flex items-center gap-2 backdrop-blur-sm cursor-pointer`}
          >
            ../
          </button>
          {path[path.length - 1].includes(".") && (
            <button
              onClick={async () => {
                if (!info) return;
                await fetch(
                  import.meta.env.VITE_SERVER_URL +
                    `/api/saveFile?id=${info.info.id}&path=${path.join(",")}`,
                  {
                    method: "post",
                    body: fileData,
                  }
                );
                setFileData(null);
                setPath((o) => {
                  const ol = [...o];
                  ol.pop();
                  return ol;
                });
              }}
              className={`mr-4 bg-green-800/40 border border-green-700 hover:border-green-600 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:bg-green-800/60 flex items-center gap-2 backdrop-blur-sm cursor-pointer`}
            >
              Save
            </button>
          )}
        </div>
      )}
      {fileData !== null ? (
        <textarea
          value={fileData}
          onChange={(e) => {
            setFileData(e.target.value);
          }}
          className="w-[90%] h-[85%] bg-slate-800/40 p-2 m-2 border border-slate-700 rounded"
        ></textarea>
      ) : (
        <div className="flex-1 p-2 flex flex-col w-[400px] gap-2">
          {files.map((f, _i) => (
            <File
              file={f}
              key={_i}
              onClick={() => {
                setPath((o) => {
                  return [...o, f];
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Files;

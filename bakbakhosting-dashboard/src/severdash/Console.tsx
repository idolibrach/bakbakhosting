import { useContext, useEffect, useRef, useState } from "react";
import { ServerContext } from "./ServerDashboardLayout";

function ConsoleMessage({ message }: { message: string }) {
  return <div className="text-white text-lg mb-1">{message}</div>;
}

const Console = () => {
  const [messages, setMessages] = useState<string[]>([
    "Connecting to console...",
  ]);
  const [input, setInput] = useState<string>("");
  const { socket } = useContext(ServerContext)!;

  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket?.emit("logs");

    socket?.on("serverLog", (msg) => {
      setMessages((messages) => [...messages, msg]);
    });

    socket?.on("logs", (logs) => {
      setMessages(logs);
    });

    return () => {
      socket?.off("serverLog");
      socket?.off("logs");
    };
  }, [socket]);

  useEffect(() => {
    if (box.current) {
      box.current.scrollTop = box.current.scrollHeight;
    }

    if (messages.length > 500)
      setMessages(messages.slice(messages.length - 100));
  }, [messages]);

  return (
    <div className="">
      <div className="w-[1000px] h-[600px] bg-white/20 rounded-3xl border-white/50 border-2 max-w-[95%] shadow-xl flex flex-col overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto" ref={box}>
          {messages.map((message, index) => (
            <ConsoleMessage key={index} message={message} />
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (socket) {
              socket.emit("message", input);
              setMessages((messages) => [...messages, `> ${input}`]);
              setInput("");
            }
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-20 bg-white/10 outline-none p-4 text-xl text-white caret-white/50 w-full"
            placeholder="Enter console commands here..."
          ></input>
        </form>
      </div>
    </div>
  );
};

export default Console;

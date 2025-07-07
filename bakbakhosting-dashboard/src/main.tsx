import { createRoot } from "react-dom/client";
import "./index.css";
import DashboardLayout from "./DashboardLayout.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import MyServers from "./myservers/MyServers.tsx";
import NewServer from "./newserver/NewServer.tsx";
import ServerDashboardLayout from "./severdash/ServerDashboardLayout.tsx";
import Home from "./severdash/Home.tsx";
import Console from "./severdash/Console.tsx";
import Files from "./severdash/Files.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<MyServers />} />
        <Route path="newserver" element={<NewServer />} />
        <Route path="server/:id" element={<ServerDashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="console" element={<Console />} />
          <Route path="files" element={<Files />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

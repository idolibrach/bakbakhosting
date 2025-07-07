import { Outlet } from "react-router";

function DashboardLayout() {
  return (
    <div className="bg-zinc-950 h-full text-white p-0">
      <Outlet />
    </div>
  );
}

export default DashboardLayout;

import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";

const AppLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

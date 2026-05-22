import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#FDFAF6]">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Layout;

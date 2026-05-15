import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { logout } from "../services/authService";
import { Button } from "@/components/ui/button";

const linkClass =
  "text-xs font-semibold uppercase tracking-widest text-[#9C8170] hover:text-[#EA580C] hover:bg-orange-50";

const Navbar = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-10 flex justify-between items-center px-6 md:px-12 py-4 bg-[#FDFAF6]/80 backdrop-blur border-b border-[#EDE0D4]">
      <Link
        to="/workspaces"
        className="text-xl font-semibold text-[#EA580C]"
        style={{ fontFamily: "Georgia, serif" }}
      >
        RedPandaFlow
      </Link>
      <div className="flex items-center gap-1">
        <Button variant="ghost" onClick={() => navigate("/workspaces")} className={linkClass}>
          Workspaces
        </Button>
        <Button variant="ghost" onClick={() => navigate("/profile")} className={linkClass}>
          Profil
        </Button>
        <Button variant="ghost" onClick={handleLogout} className={linkClass}>
          Déconnexion
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

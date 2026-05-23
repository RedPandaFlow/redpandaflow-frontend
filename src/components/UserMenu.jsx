import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChartLine, Gear, SignOut, UserCircle } from "@phosphor-icons/react";
import { AuthContext } from "../context/AuthContext";
import { UserAvatar } from "./UserAvatar";
import {
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
  DropdownSeparator,
} from "./ui/dropdown-menu";

const UserMenu = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const username = user?.username ?? "Utilisateur";
  const email = user?.email ?? "";
  const avatarUrl = user?.avatarUrl;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <DropdownMenu
      align="end"
      trigger={
        <span className="block rounded-full ring-2 ring-transparent transition-all hover:ring-orange-200">
          <UserAvatar name={username} src={avatarUrl} size={36} />
        </span>
      }
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <UserAvatar name={username} src={avatarUrl} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#1C1410]">{username}</p>
          <p className="truncate text-xs text-[#9C8170]">{email}</p>
        </div>
      </div>

      <DropdownSeparator />
      <DropdownLabel>Compte</DropdownLabel>
      <DropdownItem icon={UserCircle} onClick={() => navigate("/profile")}>
        Profil
      </DropdownItem>
      <DropdownItem icon={ChartLine} disabled hint="Bientôt">
        Activité
      </DropdownItem>
      <DropdownItem icon={Gear} disabled hint="Bientôt">
        Paramètres
      </DropdownItem>

      <DropdownSeparator />
      <DropdownItem icon={SignOut} destructive onClick={handleLogout}>
        Se déconnecter
      </DropdownItem>
    </DropdownMenu>
  );
};

export default UserMenu;

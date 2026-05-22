import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { userWorkspacePath } from "../lib/routes";
import CreateMenu from "./CreateMenu";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import CreateBoardDialog from "./CreateBoardDialog";
import logo from "../assets/redpandaflow-logo.png";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [boardDialogOpen, setBoardDialogOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-10 flex items-center gap-4 px-6 md:px-12 py-4 bg-[#FDFAF6]/80 backdrop-blur border-b border-[#EDE0D4]">
        <Link
          to={userWorkspacePath(user)}
          className="flex shrink-0 items-center gap-2 text-xl font-semibold text-[#EA580C]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <img src={logo} alt="RedPandaFlow" className="h-8 w-8" />
          RedPandaFlow
        </Link>
        <div className="flex flex-1 justify-center px-4">
          <SearchBar />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <CreateMenu
            onCreateWorkspace={() => setWorkspaceDialogOpen(true)}
            onCreateBoard={() => setBoardDialogOpen(true)}
          />
          <UserMenu />
        </div>
      </nav>

      <CreateWorkspaceDialog
        open={workspaceDialogOpen}
        onClose={() => setWorkspaceDialogOpen(false)}
      />

      <CreateBoardDialog
        open={boardDialogOpen}
        onClose={() => setBoardDialogOpen(false)}
      />
    </>
  );
};

export default Navbar;

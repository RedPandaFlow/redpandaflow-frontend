import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { CaretRight, Gear, Kanban, Plus, UsersThree } from "@phosphor-icons/react";
import { AuthContext } from "../context/AuthContext";
import { userWorkspacePath } from "../lib/routes";
import { getWorkspaces } from "../services/workspaceService";
import { getBoards } from "../services/boardService";
import { gradientFor } from "../lib/gradient";
import CreateBoardDialog from "../components/CreateBoardDialog";

const WorkspaceAction = ({ icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 rounded-md border border-[#EDE0D4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7A6558] transition-colors hover:bg-orange-50 hover:text-[#EA580C]"
  >
    <Icon size={14} />
    {label}
  </button>
);

const BoardCard = ({ board, workspaceId, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="overflow-hidden rounded-lg border border-[#EDE0D4] bg-white text-left transition-colors hover:border-orange-200"
    data-workspace-id={workspaceId}
  >
    <div className={`h-20 bg-linear-to-br ${gradientFor(board.title)}`} />
    <div className="px-3 py-2.5">
      <span className="block truncate text-sm font-semibold text-[#1C1410]">
        {board.title}
      </span>
    </div>
  </button>
);

const Workspaces = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useContext(AuthContext);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIds, setOpenIds] = useState(() => new Set());
  const [createBoardFor, setCreateBoardFor] = useState(null);

  const ownUsername = user?.user?.username;
  const wrongUser = ownUsername && username !== ownUsername;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getWorkspaces();
        const boardsPerWorkspace = await Promise.all(
          data.map((ws) => getBoards(ws.id).catch(() => []))
        );
        if (active) {
          setWorkspaces(
            data.map((ws, i) => ({ ...ws, boards: boardsPerWorkspace[i] }))
          );
        }
      } catch {
        alert("Impossible de charger les workspaces.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const toggle = (id) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (wrongUser) {
    return <Navigate to={userWorkspacePath(user)} replace />;
  }

  const myWorkspaces = workspaces.filter((ws) => ws.currentUserRole != null);
  const guestWorkspaces = workspaces.filter((ws) => ws.currentUserRole == null);

  const goToBoard = (workspaceId, boardId) =>
    navigate(`/workspace/${workspaceId}/board/${boardId}`);

  return (
    <main className="max-w-5xl mx-auto py-12 px-4 md:px-6">
      {loading ? (
        <p className="text-[#9C8170] text-sm">Chargement…</p>
      ) : workspaces.length === 0 ? (
        <p className="text-[#9C8170] text-sm">
          Aucun workspace pour le moment. Utilisez le bouton « Créer » dans la
          barre de navigation.
        </p>
      ) : (
        <div className="space-y-10">
          {myWorkspaces.length > 0 && (
            <section>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
                Vos espaces de travail
              </p>
              <div className="space-y-3">
                {myWorkspaces.map((ws) => {
                  const isActive = openIds.has(ws.id);
                  const boards = ws.boards ?? [];
                  const initial = (ws.name || "?").charAt(0).toUpperCase();
                  const detailPath = `/workspace/${ws.id}`;
                  return (
                    <div
                      key={ws.id}
                      className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                        isActive
                          ? "border-orange-200 shadow-sm"
                          : "border-[#EDE0D4]"
                      }`}
                    >
                      <div className="flex items-center gap-3 px-4 py-3 md:px-5">
                        <button
                          type="button"
                          onClick={() => toggle(ws.id)}
                          aria-expanded={isActive}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <CaretRight
                            size={14}
                            weight="bold"
                            className={`shrink-0 transition-transform ${
                              isActive
                                ? "rotate-90 text-[#EA580C]"
                                : "text-[#9C8170]"
                            }`}
                          />
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-base font-bold text-white ${gradientFor(
                              ws.name
                            )}`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-bold text-[#1C1410]">
                              {ws.name}
                            </h2>
                            <p className="truncate text-sm text-[#9C8170]">
                              {ws.description || "Pas de description"}
                            </p>
                          </div>
                        </button>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <WorkspaceAction
                            icon={Kanban}
                            label="Tableaux"
                            onClick={() =>
                              navigate(`${detailPath}?tab=boards`)
                            }
                          />
                          <WorkspaceAction
                            icon={UsersThree}
                            label="Membres"
                            onClick={() =>
                              navigate(`${detailPath}?tab=members`)
                            }
                          />
                          <WorkspaceAction
                            icon={Gear}
                            label="Paramètres"
                            onClick={() =>
                              navigate(`${detailPath}?tab=settings`)
                            }
                          />
                        </div>
                      </div>

                      {isActive && (
                        <div className="border-t border-[#EDE0D4] bg-[#FDFAF6]/60 px-4 py-4 md:px-5">
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {boards.map((board) => (
                              <BoardCard
                                key={board.id}
                                board={board}
                                workspaceId={ws.id}
                                onClick={() => goToBoard(ws.id, board.id)}
                              />
                            ))}

                            <button
                              type="button"
                              onClick={() => setCreateBoardFor(ws.id)}
                              className="flex min-h-30 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#EDE0D4] bg-white text-[#9C8170] transition-colors hover:border-orange-200 hover:text-[#EA580C]"
                            >
                              <Plus size={20} />
                              <span className="text-sm font-semibold">
                                Créer un tableau
                              </span>
                            </button>
                          </div>

                          {boards.length === 0 && (
                            <p className="mt-3 text-xs text-[#9C8170]">
                              Les tableaux de cet espace apparaîtront ici.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {guestWorkspaces.length > 0 && (
            <section>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
                Espaces de travail d'invités
              </p>
              <p className="mb-4 text-sm text-[#9C8170]">
                Vous êtes membre de ces tableaux, mais vous n'êtes pas membre de
                l'espace de travail dont les tableaux font partie.
              </p>
              <div className="space-y-6">
                {guestWorkspaces.map((ws) => {
                  const boards = ws.boards ?? [];
                  const initial = (ws.name || "?").charAt(0).toUpperCase();
                  return (
                    <div key={ws.id}>
                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-sm font-bold text-white ${gradientFor(
                            ws.name
                          )}`}
                        >
                          {initial}
                        </div>
                        <h2 className="truncate text-base font-bold text-[#1C1410]">
                          {ws.name}
                        </h2>
                      </div>
                      {boards.length === 0 ? (
                        <p className="text-xs text-[#9C8170]">
                          Aucun tableau accessible.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                          {boards.map((board) => (
                            <BoardCard
                              key={board.id}
                              board={board}
                              workspaceId={ws.id}
                              onClick={() => goToBoard(ws.id, board.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      <CreateBoardDialog
        open={createBoardFor !== null}
        onClose={() => setCreateBoardFor(null)}
        workspaceId={createBoardFor}
      />
    </main>
  );
};

export default Workspaces;

import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { CaretRight, Gear, Kanban, Plus, UsersThree } from "@phosphor-icons/react";
import { AuthContext } from "../context/AuthContext";
import { userWorkspacePath } from "../lib/routes";
import { getWorkspaces } from "../services/workspaceService";
import { gradientFor } from "../lib/gradient";

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

const Workspaces = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useContext(AuthContext);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIds, setOpenIds] = useState(() => new Set());

  const ownUsername = user?.user?.username;
  const wrongUser = ownUsername && username !== ownUsername;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getWorkspaces();
        if (active) setWorkspaces(data);
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

  return (
    <main className="max-w-5xl mx-auto py-12 px-4 md:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
          Vos espaces de travail
        </p>
      </div>

      {loading ? (
        <p className="text-[#9C8170] text-sm">Chargement…</p>
      ) : workspaces.length === 0 ? (
        <p className="text-[#9C8170] text-sm">
          Aucun workspace pour le moment. Utilisez le bouton « Créer » dans la
          barre de navigation.
        </p>
      ) : (
        <div className="space-y-3">
          {workspaces.map((ws) => {
            const isActive = openIds.has(ws.id);
            const boards = ws.boards ?? [];
            const initial = (ws.name || "?").charAt(0).toUpperCase();
            const detailPath = `/workspace/${ws.id}`;
            return (
              <div
                key={ws.id}
                className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                  isActive ? "border-orange-200 shadow-sm" : "border-[#EDE0D4]"
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
                        isActive ? "rotate-90 text-[#EA580C]" : "text-[#9C8170]"
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
                      onClick={() => toggle(ws.id)}
                    />
                    <WorkspaceAction
                      icon={UsersThree}
                      label="Membres"
                      onClick={() => navigate(`${detailPath}?tab=members`)}
                    />
                    <WorkspaceAction
                      icon={Gear}
                      label="Paramètres"
                      onClick={() => navigate(`${detailPath}?tab=settings`)}
                    />
                  </div>
                </div>

                {isActive && (
                  <div className="border-t border-[#EDE0D4] bg-[#FDFAF6]/60 px-4 py-4 md:px-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {boards.map((board) => (
                        <button
                          key={board.id}
                          type="button"
                          className="overflow-hidden rounded-lg border border-[#EDE0D4] bg-white text-left transition-colors hover:border-orange-200"
                        >
                          <div
                            className={`h-20 bg-linear-to-br ${gradientFor(
                              board.name
                            )}`}
                          />
                          <div className="px-3 py-2.5">
                            <span className="block truncate text-sm font-semibold text-[#1C1410]">
                              {board.name}
                            </span>
                          </div>
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled
                        className="flex min-h-30 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#EDE0D4] bg-white text-[#9C8170] opacity-70"
                      >
                        <Plus size={20} />
                        <span className="text-sm font-semibold">
                          Créer un tableau
                        </span>
                        <span className="text-[10px] uppercase tracking-wide">
                          Bientôt disponible
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
      )}
    </main>
  );
};

export default Workspaces;

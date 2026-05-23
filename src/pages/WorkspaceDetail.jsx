import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CaretDown, SignOut, UserPlus } from "@phosphor-icons/react";
import { AuthContext } from "../context/AuthContext";
import { userWorkspacePath } from "../lib/routes";
import { gradientFor } from "../lib/gradient";
import {
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
} from "../services/workspaceService";
import { getBoards } from "../services/boardService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import { UserAvatar } from "../components/UserAvatar";
import CreateBoardDialog from "../components/CreateBoardDialog";

const ROLES = ["Admin", "Member", "Viewer"];
const roleLabels = { Admin: "Administrateur", Member: "Membre", Viewer: "Lecteur" };

const selectClass =
  "h-9 rounded-md border border-[#EDE0D4] bg-[#FFF8F2] px-2 text-sm text-[#1C1410] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500";

const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(searchParams.get("tab") || "boards");
  const [collaboratorTab, setCollaboratorTab] = useState("members");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [memberFilter, setMemberFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);

  const load = async () => {
    try {
      const [ws, brds] = await Promise.all([
        getWorkspace(id),
        getBoards(id),
      ]);
      const mbrs = ws.currentUserRole != null ? await getMembers(id) : [];
      setWorkspace({ ...ws, boards: brds });
      setMembers(mbrs);
      setName(ws.name);
      setDescription(ws.description || "");
    } catch (error) {
      alert(error.response?.data?.message || "Workspace introuvable.");
      navigate(userWorkspacePath(user));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const workspaceBoards = workspace?.boards;
  const boardsById = useMemo(() => {
    if (!workspaceBoards) return {};
    return Object.fromEntries(workspaceBoards.map((b) => [b.id, b]));
  }, [workspaceBoards]);

  if (loading) {
    return (
      <p className="max-w-4xl mx-auto py-12 px-4 text-[#9C8170] text-sm">
        Chargement…
      </p>
    );
  }

  const isGuest = workspace.currentUserRole == null;
  const isAdmin = workspace.currentUserRole === "Admin";
  const isOwner = workspace.ownerId === currentUserId;
  const boards = workspace.boards ?? [];
  const initial = (workspace.name || "?").charAt(0).toUpperCase();

  const workspaceMembers = members.filter((m) => m.role != null);
  const singleBoardGuests = members.filter(
    (m) => m.role == null && (m.boardIds?.length ?? 0) === 1
  );
  const multiBoardGuests = members.filter(
    (m) => m.role == null && (m.boardIds?.length ?? 0) >= 2
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await updateWorkspace(id, {
        name: name.trim(),
        description: description.trim() || null,
      });
      setWorkspace((prev) => ({ ...prev, ...updated, boards: prev.boards }));
    } catch (error) {
      alert(error.response?.data?.message || "Mise à jour impossible.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement ce workspace ?")) return;
    try {
      await deleteWorkspace(id);
      navigate(userWorkspacePath(user));
    } catch (error) {
      alert(error.response?.data?.message || "Suppression impossible.");
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setBusy(true);
    try {
      await inviteMember(id, { email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail("");
      setInviteRole("Member");
      setInviteOpen(false);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Invitation impossible.");
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (memberUserId, role) => {
    try {
      await updateMemberRole(id, memberUserId, role);
      await load();
    } catch (error) {
      alert(error.response?.data?.message || "Changement de rôle impossible.");
    }
  };

  const handleRemove = async (memberUserId) => {
    const isSelf = memberUserId === currentUserId;
    const message = isSelf
      ? "Quitter ce workspace ?"
      : "Retirer ce membre du workspace ?";
    if (!window.confirm(message)) return;
    try {
      await removeMember(id, memberUserId);
      if (isSelf) navigate(userWorkspacePath(user));
      else await load();
    } catch (error) {
      alert(error.response?.data?.message || "Action impossible.");
    }
  };

  const tabs = isGuest
    ? [{ id: "boards", label: "Tableaux" }]
    : [
        { id: "boards", label: "Tableaux" },
        { id: "members", label: "Collaborateurs" },
        { id: "settings", label: "Paramètres" },
      ];

  const collaboratorTabs = [
    { id: "members", label: "Membres", count: workspaceMembers.length },
    {
      id: "single",
      label: "Invités d'un seul tableau",
      count: singleBoardGuests.length,
    },
    {
      id: "multi",
      label: "Invités de plusieurs tableaux",
      count: multiBoardGuests.length,
    },
  ];

  const visibleMembers = (() => {
    let list = members;
    if (collaboratorTab === "members") list = workspaceMembers;
    else if (collaboratorTab === "single") list = singleBoardGuests;
    else if (collaboratorTab === "multi") list = multiBoardGuests;
    if (memberFilter.trim()) {
      const needle = memberFilter.trim().toLowerCase();
      list = list.filter((m) => m.username.toLowerCase().includes(needle));
    }
    return list;
  })();

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 md:px-6">
      <button
        type="button"
        onClick={() => navigate(userWorkspacePath(user))}
        className="mb-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#9C8170] hover:text-[#EA580C]"
      >
        <ArrowLeft size={14} weight="bold" />
        Espaces de travail
      </button>

      <div className="mb-6 flex items-center gap-4">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-xl font-bold text-white ${gradientFor(
            workspace.name
          )}`}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-[#1C1410]">
            {workspace.name}
          </h1>
          <p className="truncate text-sm text-[#9C8170]">
            {workspace.description || "Pas de description"}
            {!isGuest && (
              <>
                {" "}· Votre rôle : {roleLabels[workspace.currentUserRole]}
              </>
            )}
            {isGuest && " · Invité au tableau"}
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-6 border-b border-[#EDE0D4]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-[#EA580C] text-[#EA580C]"
                : "border-transparent text-[#9C8170] hover:text-[#1C1410]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "boards" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[#1C1410]">Tableaux</h2>
            <p className="mt-1 text-sm text-[#9C8170]">
              {isGuest
                ? "Les tableaux auxquels vous avez accès dans cet espace."
                : "Les tableaux de cet espace de travail."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {boards.map((board) => (
              <button
                key={board.id}
                type="button"
                onClick={() => navigate(`/workspace/${id}/board/${board.id}`)}
                className="overflow-hidden rounded-lg border border-[#EDE0D4] bg-white text-left transition-colors hover:border-orange-200"
              >
                <div className={`h-20 bg-linear-to-br ${gradientFor(board.title)}`} />
                <div className="px-3 py-2.5">
                  <span className="block truncate text-sm font-semibold text-[#1C1410]">
                    {board.title}
                  </span>
                </div>
              </button>
            ))}
            {!isGuest && (
              <button
                type="button"
                onClick={() => setCreateBoardOpen(true)}
                className="flex min-h-30 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#EDE0D4] bg-white text-[#9C8170] transition-colors hover:border-orange-200 hover:text-[#EA580C]"
              >
                <UserPlus size={20} />
                <span className="text-sm font-semibold">Créer un tableau</span>
              </button>
            )}
          </div>
          {boards.length === 0 && (
            <p className="text-xs text-[#9C8170]">
              Aucun tableau pour le moment.
            </p>
          )}
        </section>
      )}

      {tab === "members" && !isGuest && (
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#1C1410]">Collaborateurs</h2>
            <span className="rounded-full border border-[#EDE0D4] bg-[#FFF8F2] px-2 py-0.5 text-xs font-bold text-[#7A6558]">
              {members.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 border-b border-[#EDE0D4]">
            {collaboratorTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setCollaboratorTab(t.id)}
                className={`-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors ${
                  collaboratorTab === t.id
                    ? "border-[#EA580C] text-[#EA580C]"
                    : "border-transparent text-[#9C8170] hover:text-[#1C1410]"
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          {collaboratorTab === "members" && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <p className="max-w-xl text-sm text-[#9C8170]">
                Les membres de l'espace de travail peuvent consulter et rejoindre
                tous les tableaux, et en créer de nouveaux.
              </p>
              {isAdmin && (
                <Button
                  onClick={() => setInviteOpen(true)}
                  className="shrink-0 bg-[#EA580C] font-semibold hover:bg-[#C2410C]"
                >
                  <UserPlus size={16} />
                  Inviter un membre
                </Button>
              )}
            </div>
          )}

          <Input
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            placeholder="Filtrer par nom"
            className="max-w-sm border-[#EDE0D4] bg-[#FFF8F2] focus-visible:ring-orange-500"
          />

          <div className="rounded-xl border border-[#EDE0D4] bg-white">
            {visibleMembers.length === 0 ? (
              <p className="p-4 text-sm text-[#9C8170]">
                Aucun collaborateur dans cette catégorie.
              </p>
            ) : (
              visibleMembers.map((m) => {
                const isSelf = m.userId === currentUserId;
                const canRemove = m.role != null && !m.isOwner && (isAdmin || isSelf);
                const boardIds = m.boardIds ?? [];
                return (
                  <div
                    key={m.userId}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDE0D4] px-4 py-3 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar name={m.username} size={36} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#1C1410]">
                          {m.username}
                          {isSelf && (
                            <span className="font-normal text-[#9C8170]"> (vous)</span>
                          )}
                        </p>
                        <p className="truncate text-sm text-[#9C8170]">
                          @{m.username} · {m.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {boardIds.length > 0 && (
                        <DropdownMenu
                          trigger={
                            <span className="flex items-center gap-1.5 rounded-md border border-[#EDE0D4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7A6558] hover:bg-orange-50 hover:text-[#EA580C]">
                              Tableaux ({boardIds.length})
                              <CaretDown size={12} />
                            </span>
                          }
                        >
                          {boardIds.map((bid) => {
                            const b = boardsById[bid];
                            const title = b?.title ?? "Tableau";
                            return (
                              <DropdownItem
                                key={bid}
                                onClick={() =>
                                  navigate(`/workspace/${id}/board/${bid}`)
                                }
                              >
                                {title}
                              </DropdownItem>
                            );
                          })}
                        </DropdownMenu>
                      )}

                      {m.isOwner ? (
                        <span className="rounded-md border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#EA580C]">
                          Propriétaire
                        </span>
                      ) : m.role == null ? (
                        <span className="rounded-md border border-[#EDE0D4] px-2.5 py-1 text-xs font-semibold text-[#7A6558]">
                          Invité
                        </span>
                      ) : isAdmin ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                          className={selectClass}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {roleLabels[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded-md border border-[#EDE0D4] px-2.5 py-1 text-xs font-semibold text-[#7A6558]">
                          {roleLabels[m.role]}
                        </span>
                      )}

                      {canRemove && (
                        <Button
                          variant="ghost"
                          onClick={() => handleRemove(m.userId)}
                          className="h-9 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <SignOut size={15} />
                          {isSelf ? "Quitter" : "Retirer"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {tab === "settings" && !isGuest && (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[#1C1410]">Paramètres</h2>
            <p className="mt-1 text-sm text-[#9C8170]">
              Gérez les informations de votre espace de travail.
            </p>
          </div>

          <div className="rounded-xl border border-[#EDE0D4] bg-white p-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#9C8170]">
              Informations
            </h3>
            {isAdmin ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
                    Nom
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={25}
                    className="border-[#EDE0D4] bg-[#FFF8F2] focus-visible:ring-orange-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
                    Description
                  </Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    className="border-[#EDE0D4] bg-[#FFF8F2] focus-visible:ring-orange-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="bg-[#EA580C] font-semibold hover:bg-[#C2410C]"
                >
                  {busy ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </form>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
                    Nom
                  </p>
                  <p className="text-[#1C1410]">{workspace.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
                    Description
                  </p>
                  <p className="text-[#1C1410]">
                    {workspace.description || "Pas de description"}
                  </p>
                </div>
                <p className="text-xs text-[#9C8170]">
                  Seuls les administrateurs peuvent modifier ces informations.
                </p>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="rounded-xl border border-red-200 bg-red-50/40 p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-red-600">
                Zone de danger
              </h3>
              <p className="mb-4 mt-1 text-sm text-[#9C8170]">
                La suppression d'un espace de travail est définitive et
                irréversible.
              </p>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700"
              >
                Supprimer cet espace
              </Button>
            </div>
          )}
        </section>
      )}

      <CreateBoardDialog
        open={createBoardOpen}
        onClose={() => setCreateBoardOpen(false)}
        workspaceId={id}
      />

      <Dialog
        open={inviteOpen}
        onClose={() => {
          if (!busy) setInviteOpen(false);
        }}
        title="Inviter un membre"
        description="Envoyez une invitation par email à rejoindre cet espace."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
              Email
            </Label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="nom@exemple.com"
              autoFocus
              className="border-[#EDE0D4] bg-[#FFF8F2] focus-visible:ring-orange-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
              Rôle
            </Label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className={`${selectClass} w-full`}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabels[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setInviteOpen(false)}
              disabled={busy}
              className="text-[#9C8170] hover:text-[#1C1410]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={busy || !inviteEmail.trim()}
              className="bg-[#EA580C] font-semibold hover:bg-[#C2410C]"
            >
              {busy ? "Envoi…" : "Inviter"}
            </Button>
          </div>
        </form>
      </Dialog>
    </main>
  );
};

export default WorkspaceDetail;

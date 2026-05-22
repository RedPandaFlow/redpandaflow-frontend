import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, SignOut, UserPlus } from "@phosphor-icons/react";
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
  const currentUserId = user?.user?.id;

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(searchParams.get("tab") || "boards");
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
      const [ws, mbrs, brds] = await Promise.all([
        getWorkspace(id),
        getMembers(id),
        getBoards(id),
      ]);
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

  if (loading) {
    return (
      <p className="max-w-4xl mx-auto py-12 px-4 text-[#9C8170] text-sm">
        Chargement…
      </p>
    );
  }

  const isAdmin = workspace.currentUserRole === "Admin";
  const isOwner = workspace.ownerId === currentUserId;
  const boards = workspace.boards ?? [];
  const initial = (workspace.name || "?").charAt(0).toUpperCase();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await updateWorkspace(id, {
        name: name.trim(),
        description: description.trim() || null,
      });
      setWorkspace(updated);
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

  const tabs = [
    { id: "boards", label: "Tableaux" },
    { id: "members", label: `Membres (${members.length})` },
    { id: "settings", label: "Paramètres" },
  ];

  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(memberFilter.trim().toLowerCase())
  );

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
            {workspace.description || "Pas de description"} · Votre rôle :{" "}
            {roleLabels[workspace.currentUserRole]}
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
              Les tableaux de cet espace de travail.
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
            <button
              type="button"
              onClick={() => setCreateBoardOpen(true)}
              className="flex min-h-30 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[#EDE0D4] bg-white text-[#9C8170] transition-colors hover:border-orange-200 hover:text-[#EA580C]"
            >
              <Plus size={20} />
              <span className="text-sm font-semibold">Créer un tableau</span>
            </button>
          </div>
          {boards.length === 0 && (
            <p className="text-xs text-[#9C8170]">
              Aucun tableau pour le moment.
            </p>
          )}
        </section>
      )}

      {tab === "members" && (
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#1C1410]">Membres</h2>
            <span className="rounded-full border border-[#EDE0D4] bg-[#FFF8F2] px-2 py-0.5 text-xs font-bold text-[#7A6558]">
              {members.length}
            </span>
          </div>

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

          <Input
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            placeholder="Filtrer par nom"
            className="max-w-sm border-[#EDE0D4] bg-[#FFF8F2] focus-visible:ring-orange-500"
          />

          <div className="rounded-xl border border-[#EDE0D4] bg-white">
            {filteredMembers.length === 0 ? (
              <p className="p-4 text-sm text-[#9C8170]">Aucun membre trouvé.</p>
            ) : (
              filteredMembers.map((m) => {
                const isSelf = m.userId === currentUserId;
                const canRemove = !m.isOwner && (isAdmin || isSelf);
                return (
                  <div
                    key={m.userId}
                    className="flex items-center justify-between gap-3 border-b border-[#EDE0D4] px-4 py-3 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar name={m.username} size={36} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#1C1410]">
                          {m.username}
                          {isSelf && (
                            <span className="font-normal text-[#9C8170]">
                              {" "}
                              (vous)
                            </span>
                          )}
                        </p>
                        <p className="truncate text-sm text-[#9C8170]">
                          {m.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {m.isOwner ? (
                        <span className="rounded-md border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#EA580C]">
                          Propriétaire
                        </span>
                      ) : isAdmin ? (
                        <select
                          value={m.role}
                          onChange={(e) =>
                            handleRoleChange(m.userId, e.target.value)
                          }
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

      {tab === "settings" && (
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

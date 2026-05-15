import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import {
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
} from "../services/workspaceService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const ROLES = ["Admin", "Member", "Viewer"];
const roleLabels = { Admin: "Admin", Member: "Membre", Viewer: "Lecteur" };

const selectClass =
  "h-9 rounded-md border border-[#EDE0D4] bg-[#FFF8F2] px-2 text-sm text-[#1C1410] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500";

const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const currentUserId = user?.user?.id;

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [ws, mbrs] = await Promise.all([getWorkspace(id), getMembers(id)]);
      setWorkspace(ws);
      setMembers(mbrs);
      setName(ws.name);
      setDescription(ws.description || "");
    } catch (error) {
      alert(error.response?.data?.message || "Workspace introuvable.");
      navigate("/workspaces");
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
      <div className="min-h-screen bg-[#FDFAF6]">
        <Navbar />
        <p className="max-w-3xl mx-auto py-12 px-4 text-[#9C8170] text-sm">
          Chargement…
        </p>
      </div>
    );
  }

  const isAdmin = workspace.currentUserRole === "Admin";
  const isOwner = workspace.ownerId === currentUserId;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await updateWorkspace(id, {
        name: name.trim(),
        description: description.trim() || null,
      });
      setWorkspace(updated);
      setEditing(false);
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
      navigate("/workspaces");
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
      if (isSelf) {
        navigate("/workspaces");
      } else {
        await load();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Action impossible.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFAF6]">
      <Navbar />

      <main className="max-w-3xl mx-auto py-12 px-4 md:px-0">
        <button
          onClick={() => navigate("/workspaces")}
          className="text-xs font-semibold uppercase tracking-widest text-[#9C8170] hover:text-[#EA580C] mb-4"
        >
          ← Retour
        </button>

        <Card className="border border-[#EDE0D4] shadow-sm bg-white mb-6">
          <CardContent className="p-6">
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
                    Nom
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={25}
                    className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
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
                    className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={busy}
                    className="font-semibold bg-[#EA580C] hover:bg-[#C2410C]"
                  >
                    Enregistrer
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditing(false);
                      setName(workspace.name);
                      setDescription(workspace.description || "");
                    }}
                    className="text-[#9C8170]"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-[#1C1410]">
                    {workspace.name}
                  </h1>
                  <p className="text-sm text-[#9C8170] mt-1">
                    {workspace.description || "Pas de description"}
                  </p>
                  <Badge className="mt-3 bg-orange-50 text-[#EA580C] border border-orange-100 hover:bg-orange-50">
                    Votre rôle : {roleLabels[workspace.currentUserRole]}
                  </Badge>
                </div>
                {(isAdmin || isOwner) && (
                  <div className="flex flex-col gap-2 shrink-0">
                    {isAdmin && (
                      <Button
                        variant="outline"
                        onClick={() => setEditing(true)}
                        className="border-[#EDE0D4] text-[#7A6558]"
                      >
                        Modifier
                      </Button>
                    )}
                    {isOwner && (
                      <Button
                        variant="outline"
                        onClick={handleDelete}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#9C8170] mb-3">
          Membres ({members.length})
        </h2>

        {isAdmin && (
          <Card className="border border-[#EDE0D4] shadow-sm bg-white mb-4">
            <CardContent className="p-5">
              <form
                onSubmit={handleInvite}
                className="flex flex-col sm:flex-row gap-2 sm:items-end"
              >
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]">
                    Inviter par email
                  </Label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className={selectClass}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {roleLabels[r]}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  disabled={busy}
                  className="font-semibold bg-[#EA580C] hover:bg-[#C2410C]"
                >
                  Inviter
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-2">
          {members.map((m) => {
            const isSelf = m.userId === currentUserId;
            const canRemove = !m.isOwner && (isAdmin || isSelf);
            return (
              <Card
                key={m.userId}
                className="border border-[#EDE0D4] shadow-sm bg-white"
              >
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1C1410] truncate">
                      {m.username}
                      {isSelf && (
                        <span className="text-[#9C8170] font-normal"> (vous)</span>
                      )}
                    </p>
                    <p className="text-sm text-[#9C8170] truncate">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.isOwner ? (
                      <Badge className="bg-orange-50 text-[#EA580C] border border-orange-100 hover:bg-orange-50">
                        Propriétaire
                      </Badge>
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
                      <Badge
                        variant="outline"
                        className="text-[#7A6558] border-[#EDE0D4]"
                      >
                        {roleLabels[m.role]}
                      </Badge>
                    )}
                    {canRemove && (
                      <Button
                        variant="ghost"
                        onClick={() => handleRemove(m.userId)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 h-9 px-3"
                      >
                        {isSelf ? "Quitter" : "Retirer"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default WorkspaceDetail;

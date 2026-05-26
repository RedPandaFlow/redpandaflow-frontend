import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SignOutIcon, LinkIcon } from "@phosphor-icons/react";
import { AuthContext } from "../context/AuthContext";
import {
  getBoardMembers,
  inviteBoardMember,
  updateBoardMemberRole,
  removeBoardMember,
} from "../services/boardService";
import { getMembers } from "../services/workspaceService";
import { inviteMemberSchema } from "../lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { UserAvatar } from "./UserAvatar";

const ROLES = ["Admin", "Member", "Viewer"];
const ROLE_LABELS = {
  Admin: "Administrateur",
  Member: "Membre",
  Viewer: "Lecteur",
};

const selectClass =
  "h-9 rounded-md border border-[#EDE0D4] bg-[#FFF8F2] px-2 text-sm text-[#1C1410] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500";

const ShareBoardDialog = ({ open, onClose, workspaceId, boardId }) => {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id;

  const [boardMembers, setBoardMembers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const inviteForm = useForm({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "Member" },
  });

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [members, wsMembers] = await Promise.all([
          getBoardMembers(workspaceId, boardId),
          getMembers(workspaceId).catch(() => []),
        ]);
        if (!active) return;
        setBoardMembers(members);
        setWorkspaceMembers(wsMembers);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Impossible de charger les membres.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, workspaceId, boardId]);

  const workspaceRoleByUserId = workspaceMembers.reduce((acc, m) => {
    acc[m.userId] = m.role;
    return acc;
  }, {});

  const currentMember = boardMembers.find((m) => m.userId === currentUserId);
  const isAdmin = currentMember?.role === "Admin";

  const handleInvite = async (values) => {
    setBusy(true);
    setError("");
    try {
      const member = await inviteBoardMember(workspaceId, boardId, {
        email: values.email,
        role: values.role,
      });
      setBoardMembers((prev) => [...prev, member]);
      inviteForm.reset({ email: "", role: "Member" });
      toast.success("Invitation envoyée.");
    } catch (err) {
      const message = err.response?.data?.message || "Invitation impossible.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (memberUserId, role) => {
    setBusy(true);
    setError("");
    try {
      const updated = await updateBoardMemberRole(
        workspaceId,
        boardId,
        memberUserId,
        role,
      );
      setBoardMembers((prev) =>
        prev.map((m) => (m.userId === memberUserId ? updated : m)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Changement de rôle impossible.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (memberUserId) => {
    const isSelf = memberUserId === currentUserId;
    const message = isSelf
      ? "Quitter ce tableau ?"
      : "Retirer ce membre du tableau ?";
    if (!window.confirm(message)) return;
    setBusy(true);
    setError("");
    try {
      await removeBoardMember(workspaceId, boardId, memberUserId);
      if (isSelf) {
        onClose();
        return;
      }
      setBoardMembers((prev) => prev.filter((m) => m.userId !== memberUserId));
    } catch (err) {
      setError(err.response?.data?.message || "Action impossible.");
    } finally {
      setBusy(false);
    }
  };

  const hasWorkspaceContext = workspaceMembers.length > 0;
  const subtitleFor = (member) => {
    if (!hasWorkspaceContext) return member.email;
    const wsRole = workspaceRoleByUserId[member.userId];
    if (!wsRole) return "Invité au tableau";
    return `${ROLE_LABELS[wsRole]} d'espace de travail`;
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      title="Partager le tableau"
      description="Invitez des personnes à collaborer sur ce tableau."
    >
      <div className="space-y-5">
        {isAdmin && (
          <Form {...inviteForm}>
            <form
              onSubmit={inviteForm.handleSubmit(handleInvite)}
              className="flex flex-wrap items-stretch gap-2"
              noValidate
            >
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="min-w-0 flex-1 space-y-1">
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Adresse e-mail"
                        disabled={busy}
                        className="border-[#EDE0D4] bg-[#FFF8F2] focus-visible:ring-orange-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <select
                        disabled={busy}
                        className={selectClass}
                        {...field}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={busy}
                className="bg-[#EA580C] font-semibold hover:bg-[#C2410C]"
              >
                Partager
              </Button>
            </form>
          </Form>
        )}

        <div className="flex items-start gap-3 rounded-lg border border-[#EDE0D4] bg-[#FFF8F2] px-3 py-2.5 text-[#9C8170]">
          <LinkIcon size={18} className="mt-0.5 shrink-0" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-[#1C1410]">
              Partager ce tableau avec un lien
            </p>
            <p className="text-xs">Bientôt disponible</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 border-b border-[#EDE0D4] pb-2">
            <span className="border-b-2 border-[#EA580C] pb-1 text-sm font-semibold text-[#EA580C]">
              Membres du tableau
            </span>
            <span className="rounded-full border border-[#EDE0D4] bg-[#FFF8F2] px-2 py-0.5 text-[11px] font-bold text-[#7A6558]">
              {boardMembers.length}
            </span>
          </div>

          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

          {loading ? (
            <p className="py-2 text-sm text-[#9C8170]">Chargement…</p>
          ) : boardMembers.length === 0 ? (
            <p className="py-2 text-sm text-[#9C8170]">Aucun membre.</p>
          ) : (
            <ul className="divide-y divide-[#EDE0D4]">
              {boardMembers.map((m) => {
                const isSelf = m.userId === currentUserId;
                const canRemove = !m.isOwner && (isAdmin || isSelf);
                const canChangeRole = isAdmin && !m.isOwner && !isSelf;
                return (
                  <li key={m.userId} className="flex items-center gap-3 py-2.5">
                    <UserAvatar name={m.username} src={m.avatarUrl} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#1C1410]">
                        {m.username}
                        {isSelf && (
                          <span className="font-normal text-[#9C8170]">
                            {" "}
                            (vous)
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-[#9C8170]">
                        {subtitleFor(m)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {m.isOwner ? (
                        <span className="rounded-md border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#EA580C]">
                          Propriétaire
                        </span>
                      ) : canChangeRole ? (
                        <select
                          value={m.role}
                          onChange={(e) =>
                            handleRoleChange(m.userId, e.target.value)
                          }
                          disabled={busy}
                          className={selectClass}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded-md border border-[#EDE0D4] px-2.5 py-1 text-xs font-semibold text-[#7A6558]">
                          {ROLE_LABELS[m.role]}
                        </span>
                      )}
                      {canRemove && (
                        <Button
                          variant="ghost"
                          onClick={() => handleRemove(m.userId)}
                          disabled={busy}
                          className="h-9 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <SignOutIcon size={15} />
                          {isSelf ? "Quitter" : "Retirer"}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ShareBoardDialog;

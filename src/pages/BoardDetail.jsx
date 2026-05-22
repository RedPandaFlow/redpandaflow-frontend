import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DotsThree, Plus, PencilSimple, Trash, UserPlus, X } from "@phosphor-icons/react";
import { AuthContext } from "../context/AuthContext";
import { userWorkspacePath } from "../lib/routes";
import { gradientFor } from "../lib/gradient";
import {
  getBoard,
  updateBoard,
  deleteBoard,
  createColumn,
  getBoardMembers,
} from "../services/boardService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown-menu";
import ShareBoardDialog from "../components/ShareBoardDialog";
import PresenceAvatars from "../components/PresenceAvatars";
import { createHubConnection } from "../services/signalrClient";

const BoardDetail = () => {
  const { workspaceId, boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [presence, setPresence] = useState([]);
  const [members, setMembers] = useState([]);
  const newColumnRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [data, mbrs] = await Promise.all([
          getBoard(workspaceId, boardId),
          getBoardMembers(workspaceId, boardId).catch(() => []),
        ]);
        if (active) {
          setBoard(data);
          setTitleDraft(data.title);
          setMembers(mbrs);
        }
      } catch (error) {
        alert(error.response?.data?.message || "Tableau introuvable.");
        navigate(`/workspace/${workspaceId}`);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [workspaceId, boardId, navigate]);

  useEffect(() => {
    if (addingColumn) newColumnRef.current?.focus();
  }, [addingColumn]);

  useEffect(() => {
    const connection = createHubConnection("/hubs/board");
    let cancelled = false;

    connection.on("PresenceUpdate", (payload) => {
      if (cancelled) return;
      if (payload?.boardId && String(payload.boardId) !== String(boardId)) return;
      setPresence(payload?.users ?? []);
    });

    (async () => {
      try {
        await connection.start();
        if (cancelled) {
          await connection.stop();
          return;
        }
        await connection.invoke("JoinBoard", boardId);
      } catch (err) {
        if (!cancelled) console.error("Presence connection failed", err);
      }
    })();

    return () => {
      cancelled = true;
      setPresence([]);
      (async () => {
        try {
          if (connection.state === "Connected") {
            await connection.invoke("LeaveBoard", boardId);
          }
        } catch {
          /* ignore */
        }
        try {
          await connection.stop();
        } catch {
          /* ignore */
        }
      })();
    };
  }, [boardId]);

  if (loading) {
    return (
      <p className="max-w-4xl mx-auto py-12 px-4 text-[#9C8170] text-sm">
        Chargement…
      </p>
    );
  }

  if (!board) return null;

  const columns = [...(board.columns ?? [])].sort((a, b) => a.order - b.order);

  const commitTitle = async () => {
    const next = titleDraft.trim();
    if (!next || next === board.title) {
      setTitleDraft(board.title);
      setEditingTitle(false);
      return;
    }
    setBusy(true);
    try {
      const updated = await updateBoard(workspaceId, boardId, { title: next });
      setBoard((prev) => ({ ...prev, ...updated, columns: prev.columns }));
      setTitleDraft(updated.title);
    } catch (error) {
      alert(error.response?.data?.message || "Renommage impossible.");
      setTitleDraft(board.title);
    } finally {
      setBusy(false);
      setEditingTitle(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement ce tableau ?")) return;
    try {
      await deleteBoard(workspaceId, boardId);
      navigate(userWorkspacePath(user));
    } catch (error) {
      alert(error.response?.data?.message || "Suppression impossible.");
    }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    const title = newColumnTitle.trim();
    if (!title) return;
    setBusy(true);
    try {
      const created = await createColumn(workspaceId, boardId, { title });
      setBoard((prev) => ({
        ...prev,
        columns: [...(prev.columns ?? []), created],
      }));
      setNewColumnTitle("");
      newColumnRef.current?.focus();
    } catch (error) {
      alert(error.response?.data?.message || "Création de la colonne impossible.");
    } finally {
      setBusy(false);
    }
  };

  const cancelAddColumn = () => {
    setAddingColumn(false);
    setNewColumnTitle("");
  };

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex items-center gap-3 border-b border-[#EDE0D4] bg-white px-4 py-3 md:px-6">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-sm font-bold text-white ${gradientFor(
            board.title
          )}`}
        >
          {(board.title || "?").charAt(0).toUpperCase()}
        </div>

        {editingTitle ? (
          <Input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setTitleDraft(board.title);
                setEditingTitle(false);
              }
            }}
            maxLength={25}
            autoFocus
            disabled={busy}
            className="h-9 max-w-xs border-[#EDE0D4] bg-[#FFF8F2] text-base font-bold focus-visible:ring-orange-500"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingTitle(true)}
            className="truncate rounded-md px-2 py-1 text-lg font-bold text-[#1C1410] hover:bg-orange-50"
          >
            {board.title}
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <PresenceAvatars members={members} presence={presence} />
          <Button
            onClick={() => setShareOpen(true)}
            className="bg-[#EA580C] font-semibold hover:bg-[#C2410C]"
          >
            <UserPlus size={16} />
            Partager
          </Button>
          <DropdownMenu
            trigger={
              <span className="flex size-9 items-center justify-center rounded-lg border border-[#EDE0D4] bg-white text-[#7A6558] hover:bg-orange-50 hover:text-[#EA580C]">
                <DotsThree size={20} weight="bold" />
              </span>
            }
          >
            <DropdownItem
              icon={PencilSimple}
              onClick={() => setEditingTitle(true)}
            >
              Renommer
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={Trash} destructive onClick={handleDelete}>
              Supprimer le tableau
            </DropdownItem>
          </DropdownMenu>
        </div>
      </header>

      <ShareBoardDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        workspaceId={workspaceId}
        boardId={boardId}
      />

      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#FDFAF6]">
        <div className="flex h-full items-start gap-3 p-4 md:p-6">
          {columns.map((column) => (
            <BoardColumn key={column.id} column={column} />
          ))}

          {addingColumn ? (
            <form
              onSubmit={handleAddColumn}
              className="flex w-72 shrink-0 flex-col gap-2 rounded-xl border border-[#EDE0D4] bg-white p-2 shadow-sm"
            >
              <Input
                ref={newColumnRef}
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelAddColumn();
                }}
                maxLength={25}
                placeholder="Titre de la liste"
                disabled={busy}
                className="border-[#EDE0D4] bg-[#FFF8F2] focus-visible:ring-orange-500"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={busy || !newColumnTitle.trim()}
                  className="bg-[#EA580C] font-semibold hover:bg-[#C2410C]"
                >
                  {busy ? "Ajout…" : "Ajouter une liste"}
                </Button>
                <button
                  type="button"
                  onClick={cancelAddColumn}
                  aria-label="Annuler"
                  className="rounded-lg p-1.5 text-[#9C8170] hover:bg-orange-50 hover:text-[#EA580C]"
                >
                  <X size={20} />
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAddingColumn(true)}
              className="flex w-72 shrink-0 items-center gap-2 rounded-xl border border-dashed border-[#EDE0D4] bg-white/60 px-3 py-2.5 text-sm font-semibold text-[#7A6558] transition-colors hover:bg-white hover:text-[#EA580C]"
            >
              <Plus size={16} />
              {columns.length === 0 ? "Ajouter une liste" : "Ajouter une autre liste"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

const BoardColumn = ({ column }) => {
  return (
    <section className="flex w-72 shrink-0 flex-col rounded-xl border border-[#EDE0D4] bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 px-3 py-2.5">
        <h3 className="truncate text-sm font-bold text-[#1C1410]">
          {column.title}
        </h3>
        <span className="rounded-full border border-[#EDE0D4] bg-[#FFF8F2] px-2 py-0.5 text-[11px] font-bold text-[#7A6558]">
          0
        </span>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        {/* Cards: à implémenter plus tard */}
      </div>

      <button
        type="button"
        disabled
        className="m-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#9C8170] opacity-70"
      >
        <Plus size={14} />
        Ajouter une carte
      </button>
    </section>
  );
};

export default BoardDetail;

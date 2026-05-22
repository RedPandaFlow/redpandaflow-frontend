import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  DotsThree,
  Plus,
  PencilSimple,
  Trash,
  UserPlus,
  X,
} from "@phosphor-icons/react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AuthContext } from "../context/AuthContext";
import { userWorkspacePath } from "../lib/routes";
import { gradientFor } from "../lib/gradient";
import {
  getBoard,
  updateBoard,
  deleteBoard,
  createColumn,
  deleteColumn,
  archiveColumn,
  updateColumnOrder,
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
import ArchivedColumnsDialog from "../components/ArchivedColumnsDialog";
import PresenceAvatars from "../components/PresenceAvatars";
import { createHubConnection } from "../services/signalrClient";
import CardItem from "../components/CardItem";
import { createCard, updateCardOrder } from "../services/cardService";

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
  const [archivesOpen, setArchivesOpen] = useState(false);
  const [presence, setPresence] = useState([]);
  const [members, setMembers] = useState([]);
  const newColumnRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
      if (payload?.boardId && String(payload.boardId) !== String(boardId))
        return;
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
      alert(
        error.response?.data?.message || "Création de la colonne impossible.",
      );
    } finally {
      setBusy(false);
    }
  };

  const cancelAddColumn = () => {
    setAddingColumn(false);
    setNewColumnTitle("");
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // --- 1. DÉPLACEMENT DE COLONNE ---
    if (activeType === "Column" && overType === "Column") {
      if (active.id === over.id) return;
      const ordered = [...(board.columns ?? [])].sort(
        (a, b) => a.order - b.order,
      );
      const oldIndex = ordered.findIndex((c) => c.id === active.id);
      const newIndex = ordered.findIndex((c) => c.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const previous = board.columns;
      const moved = arrayMove(ordered, oldIndex, newIndex).map((c, idx) => ({
        ...c,
        order: idx,
      }));
      setBoard((prev) => ({ ...prev, columns: moved }));

      try {
        await updateColumnOrder(workspaceId, boardId, active.id, newIndex);
      } catch (error) {
        alert(error.response?.data?.message || "Réorganisation impossible.");
        setBoard((prev) => ({ ...prev, columns: previous }));
      }
      return;
    }

    // --- 2. DÉPLACEMENT DE CARTE ---
    if (activeType === "Card") {
      const activeId = active.id;
      const overId = over.id;

      // Trouver la colonne d'origine
      const sourceColumn = board.columns.find((c) =>
        c.cards?.some((card) => card.id === activeId),
      );

      // Trouver la colonne de destination (soit on survole une colonne, soit une autre carte)
      const destColumn =
        overType === "Column"
          ? board.columns.find((c) => c.id === overId)
          : board.columns.find((c) =>
              c.cards?.some((card) => card.id === overId),
            );

      if (!sourceColumn || !destColumn) return;

      const sourceCards = [...(sourceColumn.cards || [])];
      const destCards =
        sourceColumn.id === destColumn.id
          ? sourceCards
          : [...(destColumn.cards || [])];

      const activeIndex = sourceCards.findIndex((c) => c.id === activeId);
      const overIndex =
        overType === "Column"
          ? destCards.length
          : destCards.findIndex((c) => c.id === overId);

      const previousColumns = board.columns; // Sauvegarde en cas d'erreur

      // A. Mouvement dans la MÊME colonne
      if (sourceColumn.id === destColumn.id) {
        if (activeIndex === overIndex) return;
        const movedCards = arrayMove(sourceCards, activeIndex, overIndex).map(
          (c, idx) => ({ ...c, order: idx }),
        );

        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((c) =>
            c.id === sourceColumn.id ? { ...c, cards: movedCards } : c,
          ),
        }));
      }
      // B. Mouvement vers une AUTRE colonne
      else {
        const [movedCard] = sourceCards.splice(activeIndex, 1);
        movedCard.columnId = destColumn.id;
        destCards.splice(overIndex, 0, movedCard); // Insertion
        const finalDestCards = destCards.map((c, idx) => ({
          ...c,
          order: idx,
        })); // Recalcul de l'ordre

        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((c) => {
            if (c.id === sourceColumn.id) return { ...c, cards: sourceCards };
            if (c.id === destColumn.id) return { ...c, cards: finalDestCards };
            return c;
          }),
        }));
      }

      // Appel à ton API C#
      try {
        await updateCardOrder(workspaceId, boardId, sourceColumn.id, activeId, {
          newColumnId: destColumn.id,
          newOrder: overIndex >= 0 ? overIndex : 0,
        });
      } catch (error) {
        alert("Erreur lors du déplacement de la carte.");
        setBoard((prev) => ({ ...prev, columns: previousColumns })); // Annulation visuelle
      }
    }
  };

  const handleArchiveColumn = async (columnId) => {
    const previous = board.columns;
    setBoard((prev) => ({
      ...prev,
      columns: (prev.columns ?? []).filter((c) => c.id !== columnId),
    }));
    try {
      await archiveColumn(workspaceId, boardId, columnId);
    } catch (error) {
      alert(error.response?.data?.message || "Archivage impossible.");
      setBoard((prev) => ({ ...prev, columns: previous }));
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!window.confirm("Supprimer définitivement cette liste ?")) return;
    const previous = board.columns;
    setBoard((prev) => ({
      ...prev,
      columns: (prev.columns ?? []).filter((c) => c.id !== columnId),
    }));
    try {
      await deleteColumn(workspaceId, boardId, columnId);
    } catch (error) {
      alert(error.response?.data?.message || "Suppression impossible.");
      setBoard((prev) => ({ ...prev, columns: previous }));
    }
  };

  const handleColumnRestored = (restored) => {
    setBoard((prev) => {
      const existing = prev.columns ?? [];
      const nextOrder = existing.length;
      return {
        ...prev,
        columns: [...existing, { ...restored, order: nextOrder }],
      };
    });
  };

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex items-center gap-3 border-b border-[#EDE0D4] bg-white px-4 py-3 md:px-6">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br text-sm font-bold text-white ${gradientFor(
            board.title,
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
            <DropdownItem icon={Archive} onClick={() => setArchivesOpen(true)}>
              Voir les archives
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

      <ArchivedColumnsDialog
        open={archivesOpen}
        onClose={() => setArchivesOpen(false)}
        workspaceId={workspaceId}
        boardId={boardId}
        onRestored={handleColumnRestored}
      />

      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#FDFAF6]">
        <div className="flex h-full items-start gap-3 p-4 md:p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columns.map((c) => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  workspaceId={workspaceId}
                  boardId={boardId}
                  onArchive={() => handleArchiveColumn(column.id)}
                  onDelete={() => handleDeleteColumn(column.id)}
                  onCardCreated={(columnId, newCard) => {
                    // Met à jour l'écran avec la nouvelle carte
                    setBoard((prev) => ({
                      ...prev,
                      columns: prev.columns.map((c) =>
                        c.id === columnId
                          ? { ...c, cards: [...(c.cards || []), newCard] }
                          : c,
                      ),
                    }));
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>

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
              {columns.length === 0
                ? "Ajouter une liste"
                : "Ajouter une autre liste"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};
const BoardColumn = ({
  column,
  workspaceId,
  boardId,
  onArchive,
  onDelete,
  onCardCreated,
}) => {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const newCardRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (addingCard) newCardRef.current?.focus();
  }, [addingCard]);

  // Les cartes triées par leur ordre
  const cards = [...(column.cards ?? [])].sort((a, b) => a.order - b.order);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    setBusy(true);
    try {
      const createdCard = await createCard(workspaceId, boardId, column.id, {
        title: newCardTitle.trim(),
      });
      setNewCardTitle("");
      setAddingCard(false);
      onCardCreated(column.id, createdCard); // Dit au parent de mettre à jour l'écran
    } catch (error) {
      alert(error.response?.data?.message || "Impossible de créer la carte.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className="flex w-72 shrink-0 flex-col rounded-xl border border-[#EDE0D4] bg-[#FDFAF6] shadow-sm"
    >
      {/* En-tête de la colonne (Sert de poignée pour glisser la colonne) */}
      <header
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing"
      >
        <h3 className="flex-1 truncate text-sm font-bold text-[#1C1410]">
          {column.title}
        </h3>
        <span className="rounded-full border border-[#EDE0D4] bg-white px-2 py-0.5 text-[11px] font-bold text-[#7A6558]">
          {cards.length}
        </span>
        {/* Ton dropdown existant ici... */}
      </header>

      {/* Zone des cartes */}
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={(c) => console.log("Ouvrir carte", c)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Formulaire d'ajout de carte */}
      <div className="p-2">
        {addingCard ? (
          <form onSubmit={handleAddCard} className="flex flex-col gap-2">
            <textarea
              ref={newCardRef}
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard(e);
                }
                if (e.key === "Escape") setAddingCard(false);
              }}
              disabled={busy}
              placeholder="Titre de la carte..."
              className="min-h-[60px] w-full resize-none rounded-lg border border-[#EDE0D4] bg-white p-2 text-sm text-[#1C1410] shadow-sm focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={busy || !newCardTitle.trim()}
                className="h-7 bg-[#EA580C] text-xs hover:bg-[#C2410C]"
              >
                {busy ? "..." : "Ajouter"}
              </Button>
              <button
                type="button"
                onClick={() => setAddingCard(false)}
                className="rounded p-1 text-[#9C8170] hover:bg-orange-50 hover:text-[#1C1410]"
              >
                <X size={16} />
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCard(true)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#7A6558] hover:bg-orange-50 hover:text-[#EA580C]"
          >
            <Plus size={16} />
            Ajouter une carte
          </button>
        )}
      </div>
    </section>
  );
};

export default BoardDetail;

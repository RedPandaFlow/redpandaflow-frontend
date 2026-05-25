import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  DragOverlay,
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
  updateColumn,
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
import PresenceAvatars from "../components/PresenceAvatars";
import {
  createHubConnection,
  setBoardConnectionId,
} from "../services/signalrClient";
import CardItem from "../components/CardItem";
import { createCard, updateCardOrder } from "../services/cardService";
import EditCardDialog from "../components/EditCardDialog";
import GlobalArchiveDialog from "../components/GlobalArchiveDialog";

const BoardDetail = () => {
  const { workspaceId, boardId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cardParam = searchParams.get("card");
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
  const [activeDragItem, setActiveDragItem] = useState(null);
  const selectedCard =
    board?.columns.flatMap((c) => c.cards).find((c) => c.id === cardParam) ??
    null;
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const originalColumnIdRef = useRef(null);
  const newColumnRef = useRef(null);
  const cardMutationInFlightRef = useRef(false);

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

  const openCardDetail = (card) => {
    const next = new URLSearchParams(searchParams);
    next.set("card", card.id);
    setSearchParams(next, { replace: true });
  };

  const closeCardDetail = () => {
    if (!searchParams.has("card")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("card");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    const connection = createHubConnection("/hubs/board");
    let cancelled = false;

    connection.on("PresenceUpdate", (payload) => {
      if (cancelled) return;
      if (payload?.boardId && String(payload.boardId) !== String(boardId))
        return;
      setPresence(payload?.users ?? []);
    });

    connection.on("BoardUpdated", (payload) => {
      if (cancelled || !payload) return;
      setBoard((prev) =>
        prev ? { ...prev, title: payload.title ?? prev.title } : prev,
      );
      setTitleDraft((prev) => payload.title ?? prev);
    });

    connection.on("BoardDeleted", () => {
      if (cancelled) return;
      alert("Ce tableau vient d'être supprimé.");
      navigate(userWorkspacePath(user));
    });

    connection.on("ColumnCreated", (payload) => {
      if (cancelled || !payload?.column) return;
      setBoard((prev) => {
        if (!prev) return prev;
        const existing = prev.columns ?? [];
        if (existing.some((c) => c.id === payload.column.id)) return prev;
        return { ...prev, columns: [...existing, payload.column] };
      });
    });

    connection.on("ColumnUpdated", (payload) => {
      if (cancelled || !payload?.column) return;
      const incoming = payload.column;
      setBoard((prev) => {
        if (!prev) return prev;
        const existing = prev.columns ?? [];
        const next = existing.some((c) => c.id === incoming.id)
          ? existing.map((c) => {
              if (c.id === incoming.id) {
                const cardsCascade = incoming.isArchived
                  ? (c.cards || []).map((card) => ({
                      ...card,
                      isArchived: true,
                    }))
                  : c.cards || [];
                return { ...c, ...incoming, cards: cardsCascade };
              }
              return c;
            })
          : [...existing, incoming];
        return { ...prev, columns: next };
      });
    });

    connection.on("ColumnDeleted", (payload) => {
      if (cancelled || !payload?.id) return;
      setBoard((prev) =>
        prev
          ? {
              ...prev,
              columns: (prev.columns ?? []).filter((c) => c.id !== payload.id),
            }
          : prev,
      );
    });

    connection.on("ColumnArchived", (payload) => {
      if (cancelled || !payload?.id) return;
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: (prev.columns ?? []).map((c) =>
            c.id === payload.id
              ? {
                  ...c,
                  isArchived: true,
                  cards: (c.cards || []).map((card) => ({
                    ...card,
                    isArchived: true,
                  })),
                }
              : c,
          ),
        };
      });
    });

    connection.on("ColumnRestored", (payload) => {
      if (cancelled || !payload?.column) return;
      setBoard((prev) => {
        if (!prev) return prev;
        const filtered = (prev.columns ?? []).filter(
          (c) => c.id !== payload.column.id,
        );
        return { ...prev, columns: [...filtered, payload.column] };
      });
    });

    connection.on("ColumnOrderChanged", (payload) => {
      if (cancelled || !payload?.columnId) return;
      setBoard((prev) => {
        if (!prev) return prev;
        const ordered = [...(prev.columns ?? [])].sort(
          (a, b) => a.order - b.order,
        );
        const oldIndex = ordered.findIndex((c) => c.id === payload.columnId);
        const newIndex = Math.max(
          0,
          Math.min(payload.newOrder ?? 0, ordered.length - 1),
        );
        if (oldIndex < 0 || oldIndex === newIndex) return prev;
        const moved = arrayMove(ordered, oldIndex, newIndex).map((c, idx) => ({
          ...c,
          order: idx,
        }));
        return { ...prev, columns: moved };
      });
    });

    let cardsFetchSeq = 0;
    connection.on("CardsChanged", async (payload) => {
      if (cancelled || !payload?.boardId) return;
      if (String(payload.boardId) !== String(boardId)) return;
      if (cardMutationInFlightRef.current) return;
      const seq = ++cardsFetchSeq;
      const fresh = await getBoard(workspaceId, boardId).catch(() => null);
      if (cancelled || !fresh || seq !== cardsFetchSeq) return;
      if (cardMutationInFlightRef.current) return;
      setBoard(fresh);
    });

    connection.onreconnected(async () => {
      if (cancelled) return;
      setBoardConnectionId(connection.connectionId);
      try {
        await connection.invoke("JoinBoard", boardId);
        const fresh = await getBoard(workspaceId, boardId);
        if (!cancelled) setBoard(fresh);
      } catch (err) {
        console.error("Reconnect rejoin failed", err);
      }
    });

    connection.onreconnecting(() => {
      setBoardConnectionId(null);
    });

    (async () => {
      try {
        await connection.start();
        if (cancelled) {
          await connection.stop();
          return;
        }
        setBoardConnectionId(connection.connectionId);
        await connection.invoke("JoinBoard", boardId);
      } catch (err) {
        if (!cancelled) console.error("Presence connection failed", err);
      }
    })();

    return () => {
      cancelled = true;
      setPresence([]);
      setBoardConnectionId(null);
      (async () => {
        if (connection.state === "Connected") {
          await connection.invoke("LeaveBoard", boardId).catch(() => undefined);
        }
        await connection.stop().catch(() => undefined);
      })();
    };
  }, [boardId, workspaceId, navigate, user]);

  if (loading) {
    return (
      <p className="max-w-4xl mx-auto py-12 px-4 text-[#9C8170] text-sm">
        Chargement…
      </p>
    );
  }

  if (!board) return null;

  const allColumnsSorted = [...(board.columns ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  const columns = allColumnsSorted.filter((c) => !c.isArchived);
  const currentMember = members.find((m) => m.userId === user?.id);
  const currentBoardRole = currentMember ? currentMember.role : null;

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

  const handleDragStart = (event) => {
    const activeData = event.active.data.current;
    setActiveDragItem(activeData);

    if (activeData?.type === "Card") {
      originalColumnIdRef.current = activeData.card.columnId;
      cardMutationInFlightRef.current = true;
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType !== "Card") return;

    const activeId = active.id;
    const overId = over.id;

    setBoard((prev) => {
      if (!prev) return prev;

      const sourceColumn = prev.columns.find((c) =>
        c.cards?.some((card) => card.id === activeId),
      );
      const destColumn =
        overType === "Column"
          ? prev.columns.find((c) => c.id === overId)
          : prev.columns.find((c) =>
              c.cards?.some((card) => card.id === overId),
            );

      if (!sourceColumn || !destColumn || sourceColumn.id === destColumn.id) {
        return prev;
      }

      const sourceCards = [...(sourceColumn.cards || [])];
      const destCards = [...(destColumn.cards || [])];

      const activeIndex = sourceCards.findIndex((c) => c.id === activeId);
      const overIndex =
        overType === "Column"
          ? destCards.length
          : destCards.findIndex((c) => c.id === overId);

      const [movedCard] = sourceCards.splice(activeIndex, 1);
      movedCard.columnId = destColumn.id;

      const newOverIndex = overIndex >= 0 ? overIndex : destCards.length;
      destCards.splice(newOverIndex, 0, movedCard);

      return {
        ...prev,
        columns: prev.columns.map((c) => {
          if (c.id === sourceColumn.id) return { ...c, cards: sourceCards };
          if (c.id === destColumn.id) return { ...c, cards: destCards };
          return c;
        }),
      };
    });
  };

  const handleDragEnd = async (event) => {
    setActiveDragItem(null);
    try {
      await runDragEnd(event);
    } finally {
      cardMutationInFlightRef.current = false;
    }
  };

  const runDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

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

    if (activeType === "Card") {
      const activeId = active.id;
      const overId = over.id;

      const sourceColumn = board.columns.find((c) =>
        c.cards?.some((card) => card.id === activeId),
      );

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

      const previousColumns = board.columns;

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
      } else {
        const [movedCard] = sourceCards.splice(activeIndex, 1);
        movedCard.columnId = destColumn.id;
        destCards.splice(overIndex, 0, movedCard);
        const finalDestCards = destCards.map((c, idx) => ({
          ...c,
          order: idx,
        }));

        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((c) => {
            if (c.id === sourceColumn.id) return { ...c, cards: sourceCards };
            if (c.id === destColumn.id) return { ...c, cards: finalDestCards };
            return c;
          }),
        }));
      }

      try {
        await updateCardOrder(
          workspaceId,
          boardId,
          originalColumnIdRef.current,
          activeId,
          {
            newColumnId: destColumn.id,
            newOrder: overIndex >= 0 ? overIndex : 0,
          },
        );
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Erreur lors du déplacement de la carte.",
        );
        setBoard((prev) => ({ ...prev, columns: previousColumns }));
      }
    }
  };

  const handleArchiveColumn = async (columnId) => {
    try {
      await archiveColumn(workspaceId, boardId, columnId);

      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map((c) => {
            if (c.id === columnId) {
              const updatedCards = (c.cards || []).map((card) => ({
                ...card,
                isArchived: true,
              }));
              return { ...c, isArchived: true, cards: updatedCards };
            }
            return c;
          }),
        };
      });
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
      const filtered = (prev.columns ?? []).filter((c) => c.id !== restored.id);
      const nextOrder = filtered.length;
      return {
        ...prev,
        columns: [...filtered, { ...restored, order: nextOrder }],
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
            <DropdownItem icon={Archive} onClick={() => setIsArchiveOpen(true)}>
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

      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#FDFAF6]">
        <div className="flex h-full items-start gap-3 p-4 md:p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveDragItem(null)}
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
                  onCardClick={openCardDetail}
                  onRenamed={(updated) => {
                    setBoard((prev) => ({
                      ...prev,
                      columns: prev.columns.map((c) =>
                        c.id === updated.id ? { ...c, title: updated.title } : c,
                      ),
                    }));
                  }}
                  onCardCreated={(columnId, newCard) => {
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
            <DragOverlay>
              {activeDragItem?.type === "Card" ? (
                <div className="scale-105 opacity-90 cursor-grabbing shadow-2xl">
                  <CardItem card={activeDragItem.card} />
                </div>
              ) : activeDragItem?.type === "Column" ? (
                <div className="rotate-1 scale-105 opacity-90 shadow-2xl">
                  <BoardColumn
                    column={activeDragItem.column}
                    workspaceId={workspaceId}
                    boardId={boardId}
                    onArchive={() => {}}
                    onDelete={() => {}}
                    onCardCreated={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
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

      <EditCardDialog
        key={selectedCard?.id}
        isOpen={!!selectedCard}
        onClose={closeCardDetail}
        card={selectedCard}
        workspaceId={workspaceId}
        boardId={boardId}
        currentBoardRole={currentBoardRole}
        onCardUpdated={(columnId, updatedCard) => {
          setBoard((prev) => ({
            ...prev,
            columns: prev.columns.map((c) =>
              c.id === columnId
                ? {
                    ...c,
                    cards: c.cards.map((card) =>
                      card.id === updatedCard.id ? updatedCard : card,
                    ),
                  }
                : c,
            ),
          }));
        }}
        onCardDeleted={(columnId, cardId) => {
          setBoard((prev) => ({
            ...prev,
            columns: prev.columns.map((c) =>
              c.id === columnId
                ? { ...c, cards: c.cards.filter((card) => card.id !== cardId) }
                : c,
            ),
          }));
        }}
      />
      <GlobalArchiveDialog
        open={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        board={board}
        workspaceId={workspaceId}
        boardId={boardId}
        onColumnRestored={handleColumnRestored}
        onCardRestored={(columnId, updatedCard) => {
          setBoard((prev) => ({
            ...prev,
            columns: prev.columns.map((c) =>
              c.id === columnId
                ? {
                    ...c,
                    cards: c.cards.map((card) =>
                      card.id === updatedCard.id ? updatedCard : card,
                    ),
                  }
                : c,
            ),
          }));
        }}
      />
    </main>
  );
};
const BoardColumn = ({
  column,
  workspaceId,
  boardId,
  onArchive,
  onDelete,
  onRenamed,
  onCardCreated,
  onCardClick,
}) => {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  const newCardRef = useRef(null);

  const commitTitle = async () => {
    const trimmed = titleDraft.trim();
    setEditingTitle(false);
    if (!trimmed || trimmed === column.title) {
      setTitleDraft(column.title);
      return;
    }
    try {
      const updated = await updateColumn(workspaceId, boardId, column.id, {
        title: trimmed,
      });
      onRenamed?.(updated);
    } catch (error) {
      alert(error.response?.data?.message || "Renommage impossible.");
      setTitleDraft(column.title);
    }
  };

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

  const cards = [...(column.cards ?? [])]
    .filter((c) => !c.isArchived)
    .sort((a, b) => a.order - b.order);

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
      onCardCreated(column.id, createdCard);
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
      <header
        {...(editingTitle ? {} : attributes)}
        {...(editingTitle ? {} : listeners)}
        className={`flex items-center gap-2 px-3 py-2.5 ${editingTitle ? "" : "cursor-grab active:cursor-grabbing"}`}
      >
        {editingTitle ? (
          <Input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setTitleDraft(column.title);
                setEditingTitle(false);
              }
            }}
            autoFocus
            maxLength={25}
            className="h-7 flex-1 border-[#EDE0D4] bg-white text-sm font-bold text-[#1C1410] focus-visible:ring-orange-500"
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            onDoubleClick={() => {
              setTitleDraft(column.title);
              setEditingTitle(true);
            }}
            className="flex-1 truncate text-sm font-bold text-[#1C1410]"
          >
            {column.title}
          </h3>
        )}
        <span className="rounded-full border border-[#EDE0D4] bg-white px-2 py-0.5 text-[11px] font-bold text-[#7A6558]">
          {cards.length}
        </span>
        <div onPointerDown={(e) => e.stopPropagation()}>
          <DropdownMenu
            trigger={
              <span className="flex size-7 items-center justify-center rounded-md text-[#7A6558] hover:bg-orange-50 hover:text-[#EA580C]">
                <DotsThree size={18} weight="bold" />
              </span>
            }
          >
            <DropdownItem
              icon={PencilSimple}
              onClick={() => {
                setTitleDraft(column.title);
                setEditingTitle(true);
              }}
            >
              Renommer la liste
            </DropdownItem>
            <DropdownItem icon={Archive} onClick={onArchive}>
              Archiver la liste
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={Trash} destructive onClick={onDelete}>
              Supprimer la liste
            </DropdownItem>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>
      </div>

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
              className="min-h-15 w-full resize-none rounded-lg border border-[#EDE0D4] bg-white p-2 text-sm text-[#1C1410] shadow-sm focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
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

import { useEffect, useState } from "react";
import { CheckSquareIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  addChecklistItem,
  createChecklist,
  deleteChecklist,
  deleteChecklistItem,
  getChecklists,
  updateChecklistItem,
} from "../services/checklistService";

const computeCounts = (checklists) => {
  const items = (checklists ?? []).flatMap((c) => c.items ?? []);
  return {
    checklistItemsDone: items.filter((i) => i.isFinished).length,
    checklistItemsTotal: items.length,
  };
};

const CardChecklists = ({
  workspaceId,
  boardId,
  columnId,
  cardId,
  onChecklistsChanged,
}) => {
  const [checklists, setChecklists] = useState(null);
  const [creatingChecklist, setCreatingChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newItemContent, setNewItemContent] = useState({});

  const updateChecklists = (next) => {
    const value = typeof next === "function" ? next(checklists ?? []) : next;
    setChecklists(value);
    if (onChecklistsChanged) onChecklistsChanged(computeCounts(value));
  };

  useEffect(() => {
    let active = true;
    getChecklists(workspaceId, boardId, columnId, cardId)
      .then((data) => {
        if (active) updateChecklists(data ?? []);
      })
      .catch(() => {
        if (active) updateChecklists([]);
      });
    return () => {
      active = false;
    };
  }, [workspaceId, boardId, columnId, cardId]);

  const handleCreateChecklist = async () => {
    const title = newChecklistTitle.trim();
    if (!title) return;
    const created = await createChecklist(
      workspaceId,
      boardId,
      columnId,
      cardId,
      title,
    ).catch(() => null);
    if (!created) {
      alert("Impossible de créer la checklist.");
      return;
    }
    updateChecklists((prev) => [
      ...prev,
      { ...created, items: created.items ?? [] },
    ]);
    setNewChecklistTitle("");
    setCreatingChecklist(false);
  };

  const handleDeleteChecklist = async (checklistId) => {
    if (!window.confirm("Supprimer cette checklist ?")) return;
    await deleteChecklist(
      workspaceId,
      boardId,
      columnId,
      cardId,
      checklistId,
    ).catch(() => null);
    updateChecklists((prev) => prev.filter((c) => c.id !== checklistId));
  };

  const handleAddItem = async (checklistId) => {
    const content = (newItemContent[checklistId] ?? "").trim();
    if (!content) return;
    const created = await addChecklistItem(
      workspaceId,
      boardId,
      columnId,
      cardId,
      checklistId,
      content,
    ).catch(() => null);
    if (!created) {
      alert("Impossible d'ajouter l'élément.");
      return;
    }
    updateChecklists((prev) =>
      prev.map((c) =>
        c.id === checklistId ? { ...c, items: [...c.items, created] } : c,
      ),
    );
    setNewItemContent((prev) => ({ ...prev, [checklistId]: "" }));
  };

  const handleToggleItem = async (checklistId, item) => {
    const updated = await updateChecklistItem(
      workspaceId,
      boardId,
      columnId,
      cardId,
      checklistId,
      item.id,
      { content: item.content, isFinished: !item.isFinished },
    ).catch(() => null);
    if (!updated) return;
    updateChecklists((prev) =>
      prev.map((c) =>
        c.id === checklistId
          ? {
              ...c,
              items: c.items.map((i) => (i.id === item.id ? updated : i)),
            }
          : c,
      ),
    );
  };

  const handleDeleteItem = async (checklistId, itemId) => {
    await deleteChecklistItem(
      workspaceId,
      boardId,
      columnId,
      cardId,
      checklistId,
      itemId,
    ).catch(() => null);
    updateChecklists((prev) =>
      prev.map((c) =>
        c.id === checklistId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c,
      ),
    );
  };

  if (checklists === null) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-semibold text-[#7A6558]">
          <CheckSquareIcon size={18} />
          <h3>Checklists</h3>
        </div>
        <p className="text-xs text-[#9C8170]">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 font-semibold text-[#7A6558]">
        <CheckSquareIcon size={18} />
        <h3>Checklists</h3>
      </div>

      {checklists.map((checklist) => {
        const done = checklist.items.filter((i) => i.isFinished).length;
        const total = checklist.items.length;
        const progress = total === 0 ? 0 : Math.round((done / total) * 100);

        return (
          <div
            key={checklist.id}
            className="flex flex-col gap-2 rounded-lg border border-[#EDE0D4] bg-[#FFF8F2] p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-[#1C1410]">
                {checklist.title}
              </h4>
              <button
                type="button"
                onClick={() => handleDeleteChecklist(checklist.id)}
                className="rounded p-1 text-[#9C8170] transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Supprimer la checklist"
              >
                <TrashIcon size={14} weight="bold" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9C8170]">{progress}%</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EDE0D4]">
                <div
                  className="h-full bg-[#EA580C] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="flex flex-col gap-1">
              {checklist.items.map((item) => (
                <li key={item.id} className="group flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={item.isFinished}
                    onChange={() => handleToggleItem(checklist.id, item)}
                    className="mt-1 h-3.5 w-3.5 shrink-0 accent-[#EA580C]"
                  />
                  <span
                    className={`flex-1 text-sm ${item.isFinished ? "text-[#9C8170] line-through" : "text-[#1C1410]"}`}
                  >
                    {item.content}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(checklist.id, item.id)}
                    className="rounded p-1 text-[#9C8170] opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    aria-label="Supprimer l'élément"
                  >
                    <TrashIcon size={12} weight="bold" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <input
                type="text"
                value={newItemContent[checklist.id] ?? ""}
                onChange={(e) =>
                  setNewItemContent((prev) => ({
                    ...prev,
                    [checklist.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddItem(checklist.id);
                }}
                placeholder="Ajouter un élément..."
                className="flex-1 rounded-md border border-[#EDE0D4] bg-white px-2 py-1 text-xs focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => handleAddItem(checklist.id)}
                disabled={!(newItemContent[checklist.id] ?? "").trim()}
                className="h-7 bg-[#EA580C] text-xs hover:bg-[#C2410C]"
              >
                Ajouter
              </Button>
            </div>
          </div>
        );
      })}

      {creatingChecklist ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateChecklist();
              if (e.key === "Escape") {
                setCreatingChecklist(false);
                setNewChecklistTitle("");
              }
            }}
            autoFocus
            placeholder="Titre de la checklist..."
            className="flex-1 rounded-md border border-[#EDE0D4] bg-white px-2 py-1 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleCreateChecklist}
            disabled={!newChecklistTitle.trim()}
            className="h-8 bg-[#EA580C] text-xs hover:bg-[#C2410C]"
          >
            Créer
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setCreatingChecklist(false);
              setNewChecklistTitle("");
            }}
            className="h-8 text-xs text-[#7A6558]"
          >
            Annuler
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCreatingChecklist(true)}
          className="h-8 w-fit gap-1.5 border-[#EDE0D4] bg-[#FFF8F2] text-xs text-[#7A6558] hover:bg-orange-50 hover:text-[#EA580C]"
        >
          <PlusIcon size={14} weight="bold" /> Ajouter une checklist
        </Button>
      )}
    </div>
  );
};

export default CardChecklists;

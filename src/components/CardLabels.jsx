import { useState, useEffect, useRef } from "react";
import { Tag, Plus, Check, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  getBoardLabels,
  getCardLabels,
  assignLabelToCard,
  unassignLabelFromCard,
  createBoardLabel,
  deleteBoardLabel,
} from "../services/labelService";

const PREDEFINED_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
];

const CardLabels = ({
  workspaceId,
  boardId,
  columnId,
  cardId,
  currentBoardRole,
  onLabelsChanged,
}) => {
  const [boardLabels, setBoardLabels] = useState([]);
  const [cardLabels, setCardLabels] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(PREDEFINED_COLORS[0]);
  const [isLoading, setIsLoading] = useState(true);

  const dropdownRef = useRef(null);
  const isAdmin = currentBoardRole === "Admin";

  useEffect(() => {
    loadData();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cardId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [boardLbls, cardLbls] = await Promise.all([
        getBoardLabels(workspaceId, boardId),
        getCardLabels(workspaceId, boardId, columnId, cardId),
      ]);
      setBoardLabels(boardLbls);
      setCardLabels(cardLbls);
      if (onLabelsChanged) onLabelsChanged(cardLbls);
    } catch (error) {
      console.error("Erreur labels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLabel = async (labelId) => {
    const isAssigned = cardLabels.some((l) => l.id === labelId);
    try {
      let newLabels;

      if (isAssigned) {
        await unassignLabelFromCard(
          workspaceId,
          boardId,
          columnId,
          cardId,
          labelId,
        );
        newLabels = cardLabels.filter((l) => l.id !== labelId);
      } else {
        await assignLabelToCard(
          workspaceId,
          boardId,
          columnId,
          cardId,
          labelId,
        );
        const labelToAdd = boardLabels.find((l) => l.id === labelId);
        newLabels = [...cardLabels, labelToAdd];
      }

      setCardLabels(newLabels);
      
      if (onLabelsChanged) {
        onLabelsChanged(newLabels);
      }
    } catch (error) {
      console.error("Erreur toggle label", error);
      alert("Erreur lors de l'assignation de l'étiquette.");
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const newLabel = await createBoardLabel(
        workspaceId,
        boardId,
        newLabelName,
        newLabelColor,
      );
      setBoardLabels([...boardLabels, newLabel]);
      setIsCreating(false);
      setNewLabelName("");
    } catch (error) {
      alert("Erreur lors de la création de l'étiquette.");
    }
  };

  const handleDeleteBoardLabel = async (labelId, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Supprimer cette étiquette du tableau ? Elle sera retirée de toutes les cartes.",
      )
    )
      return;
    try {
      await deleteBoardLabel(workspaceId, boardId, labelId);
      setBoardLabels(boardLabels.filter((l) => l.id !== labelId));
      setCardLabels(cardLabels.filter((l) => l.id !== labelId));
    } catch (error) {
      console.error("Erreur suppression", error);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-4 relative" ref={dropdownRef}>
      <div className="flex items-center gap-2 font-semibold text-[#7A6558]">
        <Tag size={18} />
        <h3>Étiquettes</h3>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {isLoading ? (
          <span className="text-xs text-gray-400">Chargement...</span>
        ) : (
          cardLabels.map((label) => (
            <div
              key={label.id}
              className="px-3 py-1 rounded text-xs font-semibold text-white shadow-sm flex items-center gap-1 cursor-pointer"
              style={{ backgroundColor: label.color }}
              onClick={() => setIsOpen(true)}
            >
              {label.name}
            </div>
          ))
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-7 w-7 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
        >
          <Plus size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 text-center">
            {isCreating ? "Créer une étiquette" : "Étiquettes du tableau"}
          </h4>

          {!isCreating ? (
            <div className="flex flex-col gap-2">
              {boardLabels.length === 0 && (
                <p className="text-xs text-center text-gray-400">
                  Aucune étiquette
                </p>
              )}

              {boardLabels.map((label) => {
                const isSelected = cardLabels.some((l) => l.id === label.id);
                return (
                  <div key={label.id} className="flex items-center gap-2 group">
                    <div
                      onClick={() => toggleLabel(label.id)}
                      className="flex-1 px-3 py-1.5 rounded text-sm font-medium text-white cursor-pointer hover:opacity-90 flex justify-between items-center transition"
                      style={{ backgroundColor: label.color }}
                    >
                      <span>{label.name}</span>
                      {isSelected && <Check size={14} weight="bold" />}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteBoardLabel(label.id, e)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                );
              })}

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full text-xs"
                  onClick={() => setIsCreating(true)}
                >
                  Créer une nouvelle étiquette
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nom de l'étiquette..."
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
              />
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewLabelColor(color)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${newLabelColor === color ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}
                    style={{ backgroundColor: color }}
                  >
                    {newLabelColor === color && (
                      <Check size={12} weight="bold" color="white" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim()}
                  className="flex-1 bg-[#EA580C] hover:bg-[#C2410C]"
                >
                  Créer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsCreating(false)}
                  className="flex-1"
                >
                  Retour
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardLabels;

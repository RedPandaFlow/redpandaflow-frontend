import { useEffect, useState } from "react";
import {
  ArrowCounterClockwise,
  Archive,
  List,
  Cards,
  ArrowUUpLeft,
} from "@phosphor-icons/react";
import { Dialog } from "@/components/ui/dialog";
import { getArchivedColumns, restoreColumn } from "../services/boardService";
import { updateCard } from "../services/cardService";
import { Button } from "@/components/ui/button";

const GlobalArchiveDialog = ({
  open,
  onClose,
  board,
  workspaceId,
  boardId,
  onColumnRestored,
  onCardRestored,
}) => {
  const [activeTab, setActiveTab] = useState("columns");
  const [archivedColumns, setArchivedColumns] = useState([]);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!open || activeTab !== "columns") return;
    let cancelled = false;
    (async () => {
      setLoadingColumns(true);
      try {
        const data = await getArchivedColumns(workspaceId, boardId);
        if (!cancelled) setArchivedColumns(data);
      } catch (error) {
        if (!cancelled) alert("Chargement des colonnes impossible.");
      } finally {
        if (!cancelled) setLoadingColumns(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, activeTab, workspaceId, boardId]);

  const handleRestoreColumn = async (columnId) => {
    setBusyId(columnId);
    try {
      const restored = await restoreColumn(workspaceId, boardId, columnId);
      setArchivedColumns((prev) => prev.filter((c) => c.id !== columnId));
      onColumnRestored?.(restored);
    } catch (error) {
      alert("Restauration de la colonne impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const archivedCards =
    board?.columns
      ?.flatMap((c) => c.cards || [])
      ?.filter((c) => c.isArchived) || [];

  const handleRestoreCard = async (card) => {
    setBusyId(card.id);
    try {
      const payload = {
        title: card.title,
        description: card.description,
        dueDate: card.dueDate,
        isArchived: false,
      };
      const updatedCard = await updateCard(
        workspaceId,
        boardId,
        card.columnId,
        card.id,
        payload,
      );
      onCardRestored(card.columnId, updatedCard);
    } catch (error) {
      alert("Erreur lors de la restauration de la carte.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Archives du tableau">
      <div className="flex gap-2 p-1 mb-6 bg-orange-50/50 rounded-xl border border-[#EDE0D4]">
        <button
          onClick={() => setActiveTab("columns")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "columns"
              ? "bg-white text-[#EA580C] shadow-sm ring-1 ring-[#EDE0D4]"
              : "text-[#7A6558] hover:text-[#EA580C]"
          }`}
        >
          <List size={18} /> Listes
        </button>
        <button
          onClick={() => setActiveTab("cards")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "cards"
              ? "bg-white text-[#EA580C] shadow-sm ring-1 ring-[#EDE0D4]"
              : "text-[#7A6558] hover:text-[#EA580C]"
          }`}
        >
          <Cards size={18} /> Cartes
        </button>
      </div>

      <div className="min-h-[300px] max-h-[450px] overflow-y-auto pr-1">
        {activeTab === "columns" ? (
          loadingColumns ? (
            <p className="py-12 text-center text-sm text-[#9C8170]">
              Chargement des listes…
            </p>
          ) : archivedColumns.length === 0 ? (
            <EmptyState message="Aucune liste archivée" />
          ) : (
            <ul className="flex flex-col gap-2">
              {archivedColumns.map((col) => (
                <ArchiveItem
                  key={col.id}
                  title={col.title}
                  onRestore={() => handleRestoreColumn(col.id)}
                  isBusy={busyId === col.id}
                />
              ))}
            </ul>
          )
        ) : archivedCards.length === 0 ? (
          <EmptyState message="Aucune carte archivée" />
        ) : (
          <ul className="flex flex-col gap-2">
            {archivedCards.map((card) => {
              const parentColumn = board.columns.find(
                (c) => c.id === card.columnId,
              );
              const colName =
                board.columns.find((c) => c.id === card.columnId)?.title ||
                "Inconnue";
              const isColumnArchived = parentColumn?.isArchived === true;
              return (
                <ArchiveItem
                  key={card.id}
                  title={card.title}
                  subtitle={
                    isColumnArchived
                      ? `Bloqué : La liste "${colName}" est archivée`
                      : `Origine : La liste "${colName}" est active`
                  }
                  onRestore={() => !isColumnArchived && handleRestoreCard(card)}
                  isBusy={busyId === card.id}
                  isDisabled={isColumnArchived}
                />
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-center text-[#9C8170]">
    <Archive size={40} weight="light" className="text-[#EDE0D4]" />
    <p className="text-sm">{message}</p>
  </div>
);

const ArchiveItem = ({ title, subtitle, onRestore, isBusy, isDisabled }) => (
  <li className="flex items-center justify-between gap-3 rounded-xl border border-[#EDE0D4] bg-white px-4 py-3 shadow-sm">
    <div className="flex flex-col min-w-0">
      <span className="truncate text-sm font-bold text-[#1C1410]">{title}</span>
      {subtitle && (
        <span
          className={`text-[11px] ${isDisabled ? "text-red-700 font-medium" : "text-[#9C8170]"}`}
        >
          {subtitle}
        </span>
      )}
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={onRestore}
      disabled={isBusy || isDisabled}
      className={`flex shrink-0 items-center gap-1.5 transition-colors ${
        isDisabled
          ? "text-gray-400 cursor-not-allowed hover:bg-transparent"
          : "text-[#EA580C] hover:bg-orange-50"
      }`}
    >
      <ArrowCounterClockwise size={16} weight="bold" />
      <span className="text-xs font-bold">{isBusy ? "..." : "Restaurer"}</span>
    </Button>
  </li>
);

export default GlobalArchiveDialog;

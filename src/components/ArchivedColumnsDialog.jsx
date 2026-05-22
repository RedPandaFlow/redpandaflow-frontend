import { useEffect, useState } from "react";
import { ArrowCounterClockwise, Archive } from "@phosphor-icons/react";
import { Dialog } from "@/components/ui/dialog";
import { getArchivedColumns, restoreColumn } from "../services/boardService";

const ArchivedColumnsDialog = ({ open, workspaceId, boardId, onRestored, onClose }) => {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      setLoading(true);
      try {
        const data = await getArchivedColumns(workspaceId, boardId);
        if (!cancelled) setColumns(data);
      } catch (error) {
        if (!cancelled) {
          alert(error.response?.data?.message || "Chargement des archives impossible.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, workspaceId, boardId]);

  const handleRestore = async (columnId) => {
    setBusyId(columnId);
    try {
      const restored = await restoreColumn(workspaceId, boardId, columnId);
      setColumns((prev) => prev.filter((c) => c.id !== columnId));
      onRestored?.(restored);
    } catch (error) {
      alert(error.response?.data?.message || "Restauration impossible.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Archives"
      description="Listes archivées de ce tableau"
    >
      {loading ? (
        <p className="py-6 text-center text-sm text-[#9C8170]">Chargement…</p>
      ) : columns.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-[#9C8170]">
          <Archive size={32} className="text-[#EDE0D4]" />
          <p className="text-sm">Aucune liste archivée.</p>
        </div>
      ) : (
        <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {columns.map((column) => (
            <li
              key={column.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#EDE0D4] bg-[#FFF8F2] px-3 py-2"
            >
              <span className="truncate text-sm font-medium text-[#1C1410]">
                {column.title}
              </span>
              <button
                type="button"
                onClick={() => handleRestore(column.id)}
                disabled={busyId === column.id}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#EDE0D4] bg-white px-2.5 py-1 text-xs font-semibold text-[#7A6558] transition-colors hover:bg-orange-50 hover:text-[#EA580C] disabled:opacity-60"
              >
                <ArrowCounterClockwise size={14} />
                {busyId === column.id ? "Restauration…" : "Restaurer"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
};

export default ArchivedColumnsDialog;

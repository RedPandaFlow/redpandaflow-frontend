import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBoard } from "../services/boardService";
import { getWorkspaces } from "../services/workspaceService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";

const selectClass =
  "h-9 w-full rounded-md border border-[#EDE0D4] bg-[#FFF8F2] px-2 text-sm text-[#1C1410] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500";

const CreateBoardDialog = ({ open, onClose, workspaceId, onCreated }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const needsSelect = !workspaceId;
  const effectiveWorkspaceId = workspaceId || selectedWorkspaceId;

  useEffect(() => {
    if (!open || workspaceId) return;
    let active = true;
    (async () => {
      setLoadingWorkspaces(true);
      try {
        const list = await getWorkspaces();
        if (!active) return;
        const adminWorkspaces = list.filter(
          (ws) => ws.currentUserRole === "Admin"
        );
        setWorkspaces(adminWorkspaces);
        setSelectedWorkspaceId((current) =>
          current && adminWorkspaces.some((ws) => ws.id === current)
            ? current
            : adminWorkspaces[0]?.id ?? ""
        );
      } catch {
        if (active) setError("Impossible de charger les espaces de travail.");
      } finally {
        if (active) setLoadingWorkspaces(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, workspaceId]);

  const reset = () => {
    setTitle("");
    setError("");
  };

  const handleClose = () => {
    if (creating) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const wsId = effectiveWorkspaceId;
    if (!title.trim() || !wsId) return;
    setCreating(true);
    setError("");
    try {
      const created = await createBoard(wsId, { title: title.trim() });
      reset();
      onClose();
      if (onCreated) onCreated(created);
      else navigate(`/workspace/${wsId}/board/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Création impossible.");
    } finally {
      setCreating(false);
    }
  };

  const noWorkspaces = needsSelect && !loadingWorkspaces && workspaces.length === 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Nouveau tableau"
      description="Organisez vos tâches en colonnes et cartes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {needsSelect && (
          <div className="space-y-1.5">
            <Label
              htmlFor="board-workspace"
              className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]"
            >
              Espace de travail
            </Label>
            <select
              id="board-workspace"
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              disabled={loadingWorkspaces || creating || noWorkspaces}
              className={selectClass}
            >
              {loadingWorkspaces && <option value="">Chargement…</option>}
              {noWorkspaces && (
                <option value="">Aucun espace de travail disponible</option>
              )}
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
            {noWorkspaces && (
              <p className="text-xs text-[#9C8170]">
                Vous devez être administrateur d'un espace de travail pour créer
                un tableau.
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label
            htmlFor="board-title"
            className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]"
          >
            Titre du tableau
          </Label>
          <Input
            id="board-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={25}
            placeholder="Sprint, Roadmap, Idées…"
            autoFocus
            className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={creating}
            className="text-[#9C8170] hover:text-[#1C1410]"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={
              creating ||
              !title.trim() ||
              (needsSelect && !selectedWorkspaceId)
            }
            className="font-semibold bg-[#EA580C] hover:bg-[#C2410C]"
          >
            {creating ? "Création…" : "Créer"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default CreateBoardDialog;

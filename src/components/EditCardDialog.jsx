import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CalendarBlank,
  TextAlignCenter,
  Trash,
  Archive,
} from "@phosphor-icons/react";
import { updateCard, deleteCard } from "../services/cardService";

const EditCardDialog = ({
  isOpen,
  onClose,
  card,
  workspaceId,
  boardId,
  onCardUpdated,
  onCardDeleted,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title || "");
      setDescription(card.description || "");
      setDueDate(
        card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "",
      );
    }
  }, [card]);

  if (!card) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? `${dueDate}T12:00:00Z` : null,
        isArchived: card.isArchived || false,
      };

      const updatedCard = await updateCard(
        workspaceId,
        boardId,
        card.columnId,
        card.id,
        payload,
      );
      onCardUpdated(card.columnId, updatedCard);
      onClose();
    } catch (error) {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: card.title,
        description: card.description,
        dueDate: card.dueDate,
        isArchived: true,
      };

      const updatedCard = await updateCard(
        workspaceId,
        boardId,
        card.columnId,
        card.id,
        payload,
      );
      onCardUpdated(card.columnId, updatedCard);
      onClose();
    } catch (error) {
      alert("Erreur lors de l'archivage.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Es-tu sûr de vouloir supprimer cette carte définitivement ?",
      )
    )
      return;
    setIsSaving(true);
    try {
      await deleteCard(workspaceId, boardId, card.columnId, card.id);
      onCardDeleted(card.columnId, card.id);
      onClose();
    } catch (error) {
      alert("Erreur lors de la suppression.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="Détails de la carte">
      <div className="flex flex-col gap-5 mt-2">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-300 rounded px-2 py-1 -ml-2 text-[#1C1410]"
            placeholder="Titre de la carte..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-semibold text-[#7A6558]">
            <TextAlignCenter size={18} />
            <h3>Description</h3>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ajouter une description plus détaillée..."
            className="min-h-[120px] w-full resize-none rounded-lg border border-[#EDE0D4] bg-white p-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-semibold text-[#7A6558]">
            <CalendarBlank size={18} />
            <h3>Date d'échéance</h3>
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full max-w-[200px] rounded-lg border border-[#EDE0D4] bg-white p-2 text-sm focus:border-orange-400 focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex justify-between items-center mt-2 pt-4 border-t border-[#EDE0D4]">
          <Button
            variant="ghost"
            onClick={handleDelete}
            disabled={isSaving}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 h-9 px-3"
          >
            <Trash size={18} className="mr-2" />
            Supprimer
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleArchive}
              disabled={isSaving}
              className="text-[#7A6558] h-9"
            >
              <Archive size={18} className="mr-2" /> Archiver
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="text-[#7A6558] h-9"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white h-9"
            >
              {isSaving ? "..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default EditCardDialog;

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CalendarBlank,
  TextAlignCenter,
  Trash,
  Archive,
  ChatCircleText,
  Tag,
  CheckSquare,
} from "@phosphor-icons/react";
import { updateCard, deleteCard } from "../services/cardService";
import { getCardActivities } from "../services/activityService";
import { getChecklists } from "../services/checklistService";
import { UserAvatar } from "./UserAvatar";
import { formatRelative } from "@/lib/relativeTime";
import CardComments from "./CardComments";
import CardLabels from "./CardLabels";
import CardChecklists from "./CardChecklists";

const renderActivity = (a) => {
  if (a.type === "Moved" && a.fromColumnTitle && a.toColumnTitle) {
    return (
      <>
        <span className="font-semibold">{a.username}</span>{" "}
        a déplacé cette carte de{" "}
        <span className="font-semibold">{a.fromColumnTitle}</span> à{" "}
        <span className="font-semibold">{a.toColumnTitle}</span>
      </>
    );
  }
  return (
    <>
      <span className="font-semibold">{a.username}</span>{" "}
      a ajouté cette carte à{" "}
      <span className="font-semibold">{a.toColumnTitle}</span>
    </>
  );
};

const EditCardDialog = ({
  isOpen,
  onClose,
  card,
  workspaceId,
  boardId,
  currentBoardRole,
  onCardUpdated,
  onCardDeleted,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activities, setActivities] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [showChecklists, setShowChecklists] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title || "");
      setDescription(card.description || "");
      setDueDate(
        card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : "",
      );
      setShowDate(!!card.dueDate);
    }
  }, [card]);

  useEffect(() => {
    if (!card) return;
    let active = true;
    getCardActivities(workspaceId, boardId, card.columnId, card.id)
      .then((data) => {
        if (active) setActivities(data ?? []);
      })
      .catch(() => {
        if (active) setActivities([]);
      });
    return () => {
      active = false;
    };
  }, [card, workspaceId, boardId]);

  useEffect(() => {
    if (!card) return;
    let active = true;
    getChecklists(workspaceId, boardId, card.columnId, card.id)
      .then((data) => {
        if (active && (data?.length ?? 0) > 0) setShowChecklists(true);
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, [card, workspaceId, boardId]);

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
      toast.success("Carte enregistrée.");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour.");
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
    <Dialog open={isOpen} onClose={onClose} title="Détails de la carte" size="xl">
      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-5 md:flex-row md:items-stretch md:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto md:pr-1">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-300 rounded px-2 py-1 -ml-2 text-[#1C1410]"
              placeholder="Titre de la carte..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLabels((v) => !v)}
              className="h-8 gap-1.5 border-[#EDE0D4] bg-[#FFF8F2] text-xs text-[#7A6558] hover:bg-orange-50 hover:text-[#EA580C]"
            >
              <Tag size={14} weight="bold" /> Étiquettes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDate((v) => !v)}
              className="h-8 gap-1.5 border-[#EDE0D4] bg-[#FFF8F2] text-xs text-[#7A6558] hover:bg-orange-50 hover:text-[#EA580C]"
            >
              <CalendarBlank size={14} weight="bold" /> Dates
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowChecklists((v) => !v)}
              className="h-8 gap-1.5 border-[#EDE0D4] bg-[#FFF8F2] text-xs text-[#7A6558] hover:bg-orange-50 hover:text-[#EA580C]"
            >
              <CheckSquare size={14} weight="bold" /> Checklist
            </Button>
          </div>

          {showLabels && (
            <CardLabels
              workspaceId={workspaceId}
              boardId={boardId}
              columnId={card.columnId}
              cardId={card.id}
              currentBoardRole={currentBoardRole}
              onLabelsChanged={(labels) =>
                onCardUpdated(card.columnId, { ...card, labels })
              }
            />
          )}

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

          {showDate && (
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
          )}

          {showChecklists && (
            <CardChecklists
              workspaceId={workspaceId}
              boardId={boardId}
              columnId={card.columnId}
              cardId={card.id}
              onChecklistsChanged={(counts) =>
                onCardUpdated(card.columnId, { ...card, ...counts })
              }
            />
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-semibold text-[#7A6558]">
              <ChatCircleText size={18} />
              <h3>Activité</h3>
            </div>
            {activities === null ? (
              <p className="text-xs text-[#9C8170]">Chargement…</p>
            ) : activities.length === 0 ? (
              <p className="text-xs text-[#9C8170]">Aucune activité pour le moment.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {activities.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <UserAvatar name={a.username} src={a.userAvatarUrl} size={28} />
                    <div className="min-w-0 flex-1 text-sm text-[#3F2A1F]">
                      <div>{renderActivity(a)}</div>
                      <div className="text-xs text-[#9C8170]">
                        {formatRelative(a.createdAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="flex w-full min-h-0 flex-col border-[#EDE0D4] md:w-80 md:shrink-0 md:border-l md:pl-6">
          <CardComments
            workspaceId={workspaceId}
            boardId={boardId}
            columnId={card.columnId}
            cardId={card.id}
            currentBoardRole={currentBoardRole}
          />
        </aside>
      </div>

      <div className="mt-6 mb-2 flex shrink-0 justify-between items-center pt-4 border-t border-[#EDE0D4]">
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
    </Dialog>
  );
};

export default EditCardDialog;

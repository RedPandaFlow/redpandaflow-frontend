import { useState, useEffect, useContext } from "react";
import { ChatCircle, PencilSimple, Trash } from "@phosphor-icons/react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import {
  getCardComments,
  addComment,
  updateComment,
  deleteComment,
} from "../services/commentService";

const CardComments = ({
  workspaceId,
  boardId,
  columnId,
  cardId,
  currentBoardRole,
}) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [cardId]);

  const loadComments = async () => {
    setIsLoading(true);
    const data = await getCardComments(workspaceId, boardId, columnId, cardId).catch(() => null);
    if (data) setComments(data);
    setIsLoading(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const added = await addComment(
        workspaceId,
        boardId,
        columnId,
        cardId,
        newComment,
      );
      setComments([added, ...comments]);
      setNewComment("");
    } catch (error) {
      alert(
        "Erreur du serveur : " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    try {
      const updated = await updateComment(
        workspaceId,
        boardId,
        columnId,
        cardId,
        commentId,
        editContent,
      );
      setComments(comments.map((c) => (c.id === commentId ? updated : c)));
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      alert("Impossible de modifier le commentaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await deleteComment(workspaceId, boardId, columnId, cardId, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      alert("Impossible de supprimer le commentaire.");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex items-center gap-2 font-semibold text-[#7A6558]">
        <ChatCircle size={18} />
        <h3>Commentaires</h3>
      </div>

      <div className="flex gap-3">
        <UserAvatar name={user?.username} src={user?.avatarUrl} size={32} />
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrire un commentaire..."
            className="min-h-[80px] w-full resize-none rounded-lg border border-[#EDE0D4] bg-white p-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 shadow-sm"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={isSubmitting || !newComment.trim()}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white h-8 text-xs"
            >
              Commenter
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {isLoading ? (
          <span className="text-sm text-[#9C8170]">Chargement...</span>
        ) : comments.length === 0 ? (
          <span className="text-sm text-[#9C8170]">
            Aucun commentaire pour le moment.
          </span>
        ) : (
          comments.map((comment) => {
            const isAuthor = comment.userId === user?.id;
            const isAdmin = currentBoardRole === "Admin";
            const canEdit = isAuthor;
            const canDelete = isAuthor || isAdmin;

            return (
              <div key={comment.id} className="flex gap-3">
                <UserAvatar
                  name={comment.username}
                  src={comment.userAvatarUrl}
                  size={32}
                />

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1C1410]">
                      {comment.username}
                    </span>
                    <span className="text-xs text-[#9C8170]">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {editingId === comment.id ? (
                    <div className="mt-1 flex flex-col gap-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] w-full resize-none rounded-lg border border-[#EDE0D4] p-2 text-sm focus:border-orange-400 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={isSubmitting}
                          className="h-7 bg-[#EA580C] hover:bg-[#C2410C] text-xs"
                        >
                          Sauvegarder
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="h-7 text-xs text-[#7A6558]"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 rounded-lg border border-[#EDE0D4] bg-gray-50 p-3 text-sm text-[#1C1410]">
                      {comment.content}
                    </div>
                  )}

                  {!editingId && (canEdit || canDelete) && (
                    <div className="flex gap-1 mt-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-[#7A6558] transition-colors hover:bg-orange-50 hover:text-[#EA580C]"
                        >
                          <PencilSimple size={12} weight="bold" />
                          Modifier
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-[#7A6558] transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash size={12} weight="bold" />
                          Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CardComments;

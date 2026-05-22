import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkspace } from "../services/workspaceService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";

const CreateWorkspaceDialog = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setDescription("");
    setError("");
  };

  const handleClose = () => {
    if (creating) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    try {
      const created = await createWorkspace({
        name: name.trim(),
        description: description.trim() || null,
      });
      reset();
      onClose();
      navigate(`/workspace/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Création impossible.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Nouvel espace de travail"
      description="Regroupez vos tableaux et invitez votre équipe."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="ws-name"
            className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]"
          >
            Nom du workspace
          </Label>
          <Input
            id="ws-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={25}
            placeholder="Mon équipe"
            autoFocus
            className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="ws-description"
            className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]"
          >
            Description (optionnelle)
          </Label>
          <Input
            id="ws-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="À quoi sert cet espace ?"
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
            disabled={creating || !name.trim()}
            className="font-semibold bg-[#EA580C] hover:bg-[#C2410C]"
          >
            {creating ? "Création…" : "Créer"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default CreateWorkspaceDialog;

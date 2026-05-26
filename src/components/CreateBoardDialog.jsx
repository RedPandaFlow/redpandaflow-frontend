import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createBoard } from "../services/boardService";
import { getWorkspaces } from "../services/workspaceService";
import { createBoardSchema } from "../lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const selectClass =
  "h-9 w-full rounded-md border border-[#EDE0D4] bg-[#FFF8F2] px-2 text-sm text-[#1C1410] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500";

const CreateBoardDialog = ({ open, onClose, workspaceId, onCreated }) => {
  const navigate = useNavigate();
  const needsSelect = !workspaceId;
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  const form = useForm({
    resolver: zodResolver(createBoardSchema),
    defaultValues: { title: "", workspaceId: workspaceId ?? "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    if (!open || workspaceId) return;
    let active = true;
    (async () => {
      setLoadingWorkspaces(true);
      try {
        const list = await getWorkspaces();
        if (!active) return;
        const adminWorkspaces = list.filter(
          (ws) => ws.currentUserRole === "Admin",
        );
        setWorkspaces(adminWorkspaces);
        const current = form.getValues("workspaceId");
        const isValidCurrent =
          current && adminWorkspaces.some((ws) => ws.id === current);
        if (!isValidCurrent) {
          form.setValue("workspaceId", adminWorkspaces[0]?.id ?? "");
        }
      } catch {
        toast.error("Impossible de charger les espaces de travail.");
      } finally {
        if (active) setLoadingWorkspaces(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, workspaceId, form]);

  useEffect(() => {
    if (workspaceId) form.setValue("workspaceId", workspaceId);
  }, [workspaceId, form]);

  const handleClose = () => {
    if (isSubmitting) return;
    form.reset({ title: "", workspaceId: workspaceId ?? "" });
    onClose();
  };

  const onSubmit = async (values) => {
    try {
      const created = await createBoard(values.workspaceId, {
        title: values.title,
      });
      form.reset({ title: "", workspaceId: workspaceId ?? "" });
      onClose();
      if (onCreated) onCreated(created);
      else navigate(`/workspace/${values.workspaceId}/board/${created.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Création impossible.");
    }
  };

  const noWorkspaces =
    needsSelect && !loadingWorkspaces && workspaces.length === 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Nouveau tableau"
      description="Organisez vos tâches en colonnes et cartes."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {needsSelect && (
            <FormField
              control={form.control}
              name="workspaceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Espace de travail</FormLabel>
                  <FormControl>
                    <select
                      disabled={
                        loadingWorkspaces || isSubmitting || noWorkspaces
                      }
                      className={selectClass}
                      {...field}
                    >
                      {loadingWorkspaces && (
                        <option value="">Chargement…</option>
                      )}
                      {noWorkspaces && (
                        <option value="">
                          Aucun espace de travail disponible
                        </option>
                      )}
                      {workspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>
                          {ws.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  {noWorkspaces && (
                    <FormDescription>
                      Vous devez être administrateur d'un espace de travail pour
                      créer un tableau.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre du tableau</FormLabel>
                <FormControl>
                  <Input
                    maxLength={25}
                    placeholder="Sprint, Roadmap, Idées…"
                    autoFocus
                    className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-[#9C8170] hover:text-[#1C1410]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (needsSelect && noWorkspaces)}
              className="font-semibold bg-[#EA580C] hover:bg-[#C2410C]"
            >
              {isSubmitting ? "Création…" : "Créer"}
            </Button>
          </div>
        </form>
      </Form>
    </Dialog>
  );
};

export default CreateBoardDialog;

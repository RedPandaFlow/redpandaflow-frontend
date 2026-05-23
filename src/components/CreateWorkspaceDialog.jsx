import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createWorkspace } from "../services/workspaceService";
import { createWorkspaceSchema } from "../lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const CreateWorkspaceDialog = ({ open, onClose }) => {
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "", description: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleClose = () => {
    if (isSubmitting) return;
    form.reset();
    onClose();
  };

  const onSubmit = async (values) => {
    try {
      const created = await createWorkspace({
        name: values.name,
        description: values.description?.trim() || null,
      });
      form.reset();
      onClose();
      navigate(`/workspace/${created.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Création impossible.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Nouvel espace de travail"
      description="Regroupez vos tableaux et invitez votre équipe."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du workspace</FormLabel>
                <FormControl>
                  <Input
                    maxLength={25}
                    placeholder="Mon équipe"
                    autoFocus
                    className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optionnelle)</FormLabel>
                <FormControl>
                  <Input
                    maxLength={500}
                    placeholder="À quoi sert cet espace ?"
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
              disabled={isSubmitting}
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

export default CreateWorkspaceDialog;

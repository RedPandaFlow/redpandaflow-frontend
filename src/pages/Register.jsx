import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { register } from "../services/authService";
import { registerSchema } from "../lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const fields = [
  {
    name: "username",
    label: "Nom d'utilisateur",
    type: "text",
    placeholder: "panda_roux42",
    autoComplete: "username",
  },
  {
    name: "email",
    label: "Adresse email",
    type: "email",
    placeholder: "nom@exemple.com",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Mot de passe",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "new-password",
    description: "12 caractères minimum.",
  },
  {
    name: "confirmPassword",
    label: "Confirmer",
    type: "password",
    placeholder: "••••••••",
    autoComplete: "new-password",
  },
];

const Register = () => {
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await register(
        values.username,
        values.email,
        values.password,
        values.confirmPassword,
      );
      toast.success("Inscription réussie. Connectez-vous.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'inscription.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFAF6] p-6">
      <div className="w-full max-w-110">
        <div className="text-center mb-8">
          <span
            className="text-2xl font-semibold text-[#EA580C]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            RedPandaFlow
          </span>
          <h1
            className="mt-3 text-3xl font-bold text-[#1C1410]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Rejoignez l'aventure
          </h1>
          <p className="mt-2 text-sm text-[#9C8170]">
            Créez votre compte en quelques secondes.
          </p>
        </div>

        <Card className="border shadow-sm border-[#EDE0D4] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-[#1C1410]">
              Créer un compte
            </CardTitle>
            <CardDescription className="text-[#9C8170]">
              Tous les champs sont requis.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                {fields.map((f) => (
                  <FormField
                    key={f.name}
                    control={form.control}
                    name={f.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{f.label}</FormLabel>
                        <FormControl>
                          <Input
                            type={f.type}
                            placeholder={f.placeholder}
                            autoComplete={f.autoComplete}
                            className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                            {...field}
                          />
                        </FormControl>
                        {f.description && (
                          <FormDescription>{f.description}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full font-semibold bg-[#EA580C] hover:bg-[#C2410C] mt-2"
                >
                  {form.formState.isSubmitting
                    ? "Inscription…"
                    : "Créer mon compte →"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-0">
            <Separator className="bg-[#EDE0D4]" />
            <p className="text-sm text-center text-[#9C8170]">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#EA580C] hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;

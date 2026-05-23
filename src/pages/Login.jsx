import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import { login } from "../services/authService";
import { userWorkspacePath } from "../lib/routes";
import { loginSchema } from "../lib/schemas";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    try {
      const data = await login(values.email, values.password);
      setUser(data);
      navigate(userWorkspacePath(data));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Email ou mot de passe incorrect.",
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FDFAF6]">
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-100">
          <Card className="border shadow-sm border-[#EDE0D4] bg-white">
            <CardHeader className="pb-4">
              <CardTitle
                className="text-2xl font-bold text-[#1C1410]"
                style={{ letterSpacing: "-0.02em" }}
              >
                Content de vous revoir
              </CardTitle>
              <CardDescription className="text-[#9C8170]">
                Entrez vos accès pour continuer.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="nom@exemple.com"
                            autoComplete="email"
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full font-semibold bg-[#EA580C] hover:bg-[#C2410C] mt-2"
                  >
                    {form.formState.isSubmitting
                      ? "Connexion…"
                      : "Se connecter →"}
                  </Button>
                </form>
              </Form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-0">
              <Separator className="bg-[#EDE0D4]" />
              <p className="text-sm text-center text-[#9C8170]">
                Nouveau ici ?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#EA580C] hover:underline"
                >
                  Créer un compte
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;

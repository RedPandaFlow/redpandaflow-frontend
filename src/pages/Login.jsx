import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login } from "../services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      setUser(data);
      navigate("/profile");
    } catch (error) {
      alert(error.response?.data?.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FDFAF6]">
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-100">
          <div className="lg:hidden text-center mb-8">
          </div>

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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]"
                  >
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]"
                  >
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold bg-[#EA580C] hover:bg-[#C2410C] mt-2"
                >
                  {loading ? "Connexion…" : "Se connecter →"}
                </Button>
              </form>
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

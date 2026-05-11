import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
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

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.confirmPassword,
      );
      alert("Inscription réussie ! Connectez-vous.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) =>
    setFormData({ ...formData, [key]: e.target.value });

  const fields = [
    {
      key: "username",
      label: "Nom d'utilisateur",
      type: "text",
      placeholder: "panda_roux42",
    },
    {
      key: "email",
      label: "Adresse email",
      type: "email",
      placeholder: "nom@exemple.com",
    },
    {
      key: "password",
      label: "Mot de passe",
      type: "password",
      placeholder: "••••••••",
    },
    {
      key: "confirmPassword",
      label: "Confirmer",
      type: "password",
      placeholder: "••••••••",
    },
  ];

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
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ key, label, type, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <Label
                    htmlFor={key}
                    className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]"
                  >
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type={type}
                    placeholder={placeholder}
                    value={formData[key]}
                    onChange={set(key)}
                    required
                    className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                  />
                </div>
              ))}

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-semibold bg-[#EA580C] hover:bg-[#C2410C] mt-2"
              >
                {loading ? "Inscription…" : "Créer mon compte →"}
              </Button>
            </form>
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

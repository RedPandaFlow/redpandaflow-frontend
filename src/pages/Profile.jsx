import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFAF6]">
        <p className="text-[#9C8170] text-sm">Chargement…</p>
      </div>
    );
  }

  const username = user?.user?.username ?? "—";
  const email = user?.user?.email ?? "—";
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FDFAF6]">
      <nav className="sticky top-0 z-10 flex justify-between items-center px-6 md:px-12 py-4 bg-[#FDFAF6]/80 backdrop-blur border-b border-[#EDE0D4]">
        <span
          className="text-xl font-semibold text-[#EA580C]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          RedPandaFlow
        </span>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-xs font-semibold uppercase tracking-widest text-[#9C8170] hover:text-[#EA580C] hover:bg-orange-50"
        >
          Déconnexion
        </Button>
      </nav>

      <main className="max-w-2xl mx-auto py-12 px-4 md:px-0">
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#EA580C] mb-1">
            Votre espace
          </p>
          <h1
            className="text-3xl font-bold text-[#1C1410]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Bonjour, {username}
          </h1>
        </div>

        <Card className="border border-[#EDE0D4] shadow-sm bg-white overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl font-bold text-[#EA580C] shrink-0">
                {initial}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-[#1C1410]">{username}</h2>
                <p className="text-sm text-[#9C8170] mt-0.5">{email}</p>
                <div className="flex gap-2 mt-4 justify-center sm:justify-start flex-wrap">
                  <Badge className="bg-orange-50 text-[#EA580C] border border-orange-100 hover:bg-orange-50">
                    Actif
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[#7A6558] border-[#EDE0D4]"
                  >
                    Membre Standard
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;

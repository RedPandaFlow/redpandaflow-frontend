import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getWorkspaces, createWorkspace } from "../services/workspaceService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const roleLabels = {
  Admin: "Admin",
  Member: "Membre",
  Viewer: "Lecteur",
};

const Workspaces = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getWorkspaces();
        if (active) setWorkspaces(data);
      } catch {
        alert("Impossible de charger les workspaces.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const created = await createWorkspace({
        name: name.trim(),
        description: description.trim() || null,
      });
      setName("");
      setDescription("");
      navigate(`/workspaces/${created.id}`);
    } catch (error) {
      alert(error.response?.data?.message || "Création impossible.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFAF6]">
      <Navbar />

      <main className="max-w-3xl mx-auto py-12 px-4 md:px-0">
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#EA580C] mb-1">Vos espaces</p>
          <h1
            className="text-3xl font-bold text-[#1C1410]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Mes workspaces
          </h1>
        </div>

        <Card className="border border-[#EDE0D4] shadow-sm bg-white mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]"
                >
                  Nom du workspace
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={25}
                  placeholder="Mon équipe"
                  className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="description"
                  className="text-xs font-semibold uppercase tracking-widest text-[#9C8170]"
                >
                  Description (optionnelle)
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  placeholder="À quoi sert cet espace ?"
                  className="bg-[#FFF8F2] border-[#EDE0D4] focus-visible:ring-orange-500"
                />
              </div>
              <Button
                type="submit"
                disabled={creating}
                className="font-semibold bg-[#EA580C] hover:bg-[#C2410C]"
              >
                {creating ? "Création…" : "Créer un workspace"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-[#9C8170] text-sm">Chargement…</p>
        ) : workspaces.length === 0 ? (
          <p className="text-[#9C8170] text-sm">
            Aucun workspace pour le moment. Créez-en un ci-dessus.
          </p>
        ) : (
          <div className="grid gap-3">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => navigate(`/workspaces/${ws.id}`)}
                className="text-left"
              >
                <Card className="border border-[#EDE0D4] shadow-sm bg-white hover:border-orange-200 transition-colors">
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-[#1C1410] truncate">
                        {ws.name}
                      </h2>
                      <p className="text-sm text-[#9C8170] truncate">
                        {ws.description || "Pas de description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className="text-[#7A6558] border-[#EDE0D4]"
                      >
                        {ws.memberCount} membre{ws.memberCount > 1 ? "s" : ""}
                      </Badge>
                      <Badge className="bg-orange-50 text-[#EA580C] border border-orange-100 hover:bg-orange-50">
                        {roleLabels[ws.currentUserRole] ?? ws.currentUserRole}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Workspaces;

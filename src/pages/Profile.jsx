import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import {
  deleteAccount,
  deleteAvatar,
  uploadAvatar,
} from "../services/authService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { resolveAvatarUrl } from "@/lib/avatar";

const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto py-12 px-4 md:px-0">
        <p className="text-[#9C8170] text-sm">Chargement…</p>
      </main>
    );
  }

  const username = user?.username ?? "—";
  const email = user?.email ?? "—";
  const initial = username.charAt(0).toUpperCase();
  const avatarUrl = resolveAvatarUrl(user.avatarUrl);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      setUser(null);
      toast.success("Votre compte a été supprimé.");
      navigate("/register");
    } catch (error) {
      const status = error.response?.status;
      const backendMessage = error.response?.data?.message;
      if (status === 409) {
        toast.error(
          backendMessage?.includes("workspaces")
            ? "Transférez d'abord la propriété de vos espaces de travail."
            : backendMessage?.includes("boards")
              ? "Transférez d'abord la propriété de vos tableaux."
              : "Suppression impossible : vous possédez encore des ressources partagées.",
        );
      } else {
        toast.error("Impossible de supprimer le compte. Réessayez plus tard.");
      }
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Format non supporté. Utilisez PNG, JPEG ou WebP.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Le fichier dépasse 2 Mo.");
      return;
    }

    setAvatarBusy(true);
    try {
      const data = await uploadAvatar(file);
      setUser({ ...user, avatarUrl: data.avatarUrl });
      toast.success("Photo de profil mise à jour.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ?? "Impossible d'envoyer la photo.",
      );
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarBusy(true);
    try {
      await deleteAvatar();
      setUser({ ...user, avatarUrl: null });
      toast.success("Photo de profil supprimée.");
    } catch {
      toast.error("Impossible de supprimer la photo.");
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
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
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="w-20 h-20 rounded-2xl border border-orange-100 object-cover shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl font-bold text-[#EA580C] shrink-0">
                {initial}
              </div>
            )}

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
              <div className="flex gap-2 mt-4 justify-center sm:justify-start flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileSelected}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarBusy}
                >
                  {avatarBusy
                    ? "Envoi…"
                    : avatarUrl
                      ? "Changer la photo"
                      : "Ajouter une photo"}
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={handleRemoveAvatar}
                    disabled={avatarBusy}
                  >
                    Retirer
                  </Button>
                )}
              </div>
              <p className="text-xs text-[#9C8170] mt-2">
                PNG, JPEG ou WebP — 2 Mo maximum.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-red-200 shadow-sm bg-white overflow-hidden mt-8">
        <CardContent className="p-6 sm:p-8">
          <h3 className="text-base font-bold text-red-700">Zone de danger</h3>
          <p className="text-sm text-[#7A6558] mt-1">
            La suppression de votre compte est définitive. Vos données
            personnelles seront effacées et vos commentaires anonymisés.
          </p>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="mt-4"
            onClick={() => setConfirmOpen(true)}
          >
            Supprimer mon compte
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        title="Supprimer définitivement votre compte ?"
        description="Cette action est irréversible. Vous perdrez l'accès à toutes vos données."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setConfirmOpen(false)}
            disabled={deleting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression…" : "Supprimer définitivement"}
          </Button>
        </div>
      </Dialog>
    </main>
  );
};

export default Profile;

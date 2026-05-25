import { useNavigate } from "react-router-dom";
import { X } from "@phosphor-icons/react";
import { gradientFor } from "../lib/gradient";
import { UserAvatar } from "./UserAvatar";

const MemberPopover = ({ user, isSelf, onClose }) => {
  const navigate = useNavigate();

  return (
    <div
      role="dialog"
      className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[#EDE0D4] bg-white shadow-xl"
    >
      <div className={`relative bg-linear-to-br ${gradientFor(user.username)} px-4 pt-4 pb-4`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-2 top-2 rounded-md p-1 text-white/90 transition-colors hover:bg-black/15"
        >
          <X size={16} weight="bold" />
        </button>

        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-full border-4 border-white bg-white">
            <UserAvatar name={user.username} src={user.avatarUrl} size={56} />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <p className="truncate font-bold text-white">{user.username}</p>
            <p className="truncate text-xs text-white/80">@{user.username}</p>
            {user.email && (
              <p className="truncate text-xs text-white/80">{user.email}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#EDE0D4]">
        {isSelf && (
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/profile");
            }}
            className="block w-full px-4 py-3 text-left text-sm text-[#1C1410] transition-colors hover:bg-orange-50"
          >
            Modifier les informations du profil
          </button>
        )}
        <button
          type="button"
          disabled
          className="block w-full border-t border-[#EDE0D4] px-4 py-3 text-left text-sm text-[#9C8170] opacity-70 first:border-t-0"
        >
          Afficher les activités de tableau de ce membre
        </button>
      </div>
    </div>
  );
};

export default MemberPopover;

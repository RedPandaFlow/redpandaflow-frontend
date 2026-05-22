import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { UserAvatar } from "./UserAvatar";
import MemberPopover from "./MemberPopover";

const MAX_VISIBLE = 5;

const PresenceAvatarItem = ({ user, currentUserId, online, open, onToggle, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        title={online ? user.username : `${user.username} (hors ligne)`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`block rounded-full ring-2 ring-white transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-orange-500 ${
          online ? "" : "grayscale opacity-60"
        }`}
      >
        <UserAvatar name={user.username} size={32} />
      </button>
      {open && (
        <MemberPopover
          user={user}
          isSelf={user.userId === currentUserId}
          onClose={onClose}
        />
      )}
    </div>
  );
};

const PresenceAvatars = ({ members, presence }) => {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.user?.id;
  const [openUserId, setOpenUserId] = useState(null);

  const list = useMemo(() => {
    const presenceById = new Map((presence ?? []).map((p) => [p.userId, p]));
    const memberList = (members ?? []).map((m) => ({
      userId: m.userId,
      username: m.username,
      email: m.email,
      isOnline: presenceById.has(m.userId),
    }));
    const knownIds = new Set(memberList.map((m) => m.userId));
    for (const p of presence ?? []) {
      if (!knownIds.has(p.userId)) {
        memberList.push({ userId: p.userId, username: p.username, email: null, isOnline: true });
      }
    }
    memberList.sort((a, b) => {
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      return a.username.localeCompare(b.username);
    });
    return memberList;
  }, [members, presence]);

  if (list.length === 0) return null;

  const visible = list.slice(0, MAX_VISIBLE);
  const overflow = list.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((u) => (
        <PresenceAvatarItem
          key={u.userId}
          user={u}
          currentUserId={currentUserId}
          online={u.isOnline}
          open={openUserId === u.userId}
          onToggle={() =>
            setOpenUserId((cur) => (cur === u.userId ? null : u.userId))
          }
          onClose={() => setOpenUserId(null)}
        />
      ))}
      {overflow > 0 && (
        <div
          title={`${overflow} de plus`}
          className="flex size-8 items-center justify-center rounded-full bg-[#9C8170] text-xs font-bold text-white ring-2 ring-white"
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

export default PresenceAvatars;

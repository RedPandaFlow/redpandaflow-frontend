import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellIcon } from "@phosphor-icons/react";
import { AuthContext } from "../context/AuthContext";
import {
  deleteAllNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import { createHubConnection } from "../services/signalrClient";
import { UserAvatar } from "./UserAvatar";
import { formatRelative } from "@/lib/relativeTime";

const renderNotification = (n) => {
  if (n.type === "CardMoved" && n.fromColumnTitle && n.toColumnTitle) {
    return (
      <>
        <span className="font-semibold">{n.actorUsername}</span> a déplacé{" "}
        <span className="font-semibold">{n.cardTitle}</span> de{" "}
        <span className="font-semibold">{n.fromColumnTitle}</span> à{" "}
        <span className="font-semibold">{n.toColumnTitle}</span>
      </>
    );
  }
  return (
    <>
      <span className="font-semibold">{n.actorUsername}</span> a ajouté{" "}
      <span className="font-semibold">{n.cardTitle}</span> à{" "}
      <span className="font-semibold">{n.toColumnTitle}</span>
    </>
  );
};

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getNotifications()
      .then((data) => {
        if (active) setNotifications(data ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const connection = createHubConnection("/hubs/notifications");
    connection.on("NewNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    });
    connection.start().catch(() => {});
    return () => {
      connection.stop().catch(() => {});
    };
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = async (notification) => {
    setOpen(false);
    if (notification.cardId) {
      navigate(
        `/workspace/${notification.workspaceId}/board/${notification.boardId}?card=${notification.cardId}`,
      );
    } else {
      navigate(
        `/workspace/${notification.workspaceId}/board/${notification.boardId}`,
      );
    }
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      );
      markNotificationRead(notification.id).catch(() => {});
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    markAllNotificationsRead().catch(() => {});
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;
    setNotifications([]);
    deleteAllNotifications().catch(() => {});
  };

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#7A6558] transition-colors hover:bg-orange-50 hover:text-[#EA580C]"
      >
        <BellIcon size={20} weight="bold" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EA580C] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-96 overflow-hidden rounded-lg border border-[#EDE0D4] bg-white shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-[#EDE0D4] px-4 py-3">
            <h3 className="text-sm font-bold text-[#1C1410]">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="text-xs font-semibold text-[#EA580C] hover:underline"
                >
                  Tout marquer comme lu
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Tout supprimer
                </button>
              )}
            </div>
          </div>

          <div className="max-h-112 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[#9C8170]">
                Aucune notification pour le moment.
              </p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className={`flex w-full items-start gap-3 border-b border-[#EDE0D4] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#FDF3EA] ${
                        n.isRead ? "" : "bg-orange-50/40"
                      }`}
                    >
                      <UserAvatar
                        name={n.actorUsername}
                        src={n.actorAvatarUrl}
                        size={32}
                      />
                      <div className="min-w-0 flex-1 text-sm text-[#3F2A1F]">
                        <div>{renderNotification(n)}</div>
                        <div className="mt-0.5 text-xs text-[#9C8170]">
                          {n.boardTitle} · {formatRelative(n.createdAt)}
                        </div>
                      </div>
                      {!n.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#EA580C]" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

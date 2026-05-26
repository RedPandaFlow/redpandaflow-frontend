import { useState, useEffect, useRef } from "react";
import { UsersIcon, PlusIcon, CheckIcon } from "@phosphor-icons/react";
import {
  getCardMembers,
  assignUserToCard,
  unassignUserFromCard,
} from "../services/cardUserService";
import { UserAvatar } from "./UserAvatar";

const CardMembers = ({
  workspaceId,
  boardId,
  columnId,
  cardId,
  boardMembers = [],
  onMembersChanged,
}) => {
  const [cardMembers, setCardMembers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadData();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cardId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const members = await getCardMembers(
        workspaceId,
        boardId,
        columnId,
        cardId,
      );
      setCardMembers(members || []);
      if (onMembersChanged) onMembersChanged(members || []);
    } catch (error) {
      console.error("Erreur chargement membres:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMember = async (boardMember) => {
    const targetUserId = boardMember.userId || boardMember.id;
    const targetUsername =
      boardMember.user?.username || boardMember.username || "U";
    const targetAvatarUrl =
      boardMember.user?.avatarUrl || boardMember.avatarUrl;

    const isAssigned = cardMembers.some((m) => m.id === targetUserId);
    try {
      let newMembers;
      if (isAssigned) {
        await unassignUserFromCard(
          workspaceId,
          boardId,
          columnId,
          cardId,
          targetUserId,
        );
        newMembers = cardMembers.filter((m) => m.id !== targetUserId);
      } else {
        await assignUserToCard(
          workspaceId,
          boardId,
          columnId,
          cardId,
          targetUserId,
        );
        const newUser = {
          id: targetUserId,
          username: targetUsername,
          avatarUrl: targetAvatarUrl,
        };
        newMembers = [...cardMembers, newUser];
      }
      setCardMembers(newMembers);
      if (onMembersChanged) onMembersChanged(newMembers);
    } catch (error) {
      console.error("Erreur toggle member", error);
      alert("Erreur lors de l'assignation du membre.");
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-4 relative" ref={dropdownRef}>
      <div className="flex items-center gap-2 font-semibold text-[#7A6558]">
        <UsersIcon size={18} />
        <h3>Membres</h3>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {isLoading ? (
          <span className="text-xs text-gray-400">Chargement...</span>
        ) : (
          cardMembers.map((member) => (
            <div
              key={member.id}
              className="cursor-pointer rounded-full ring-2 ring-white"
              title={member.username}
              onClick={() => setIsOpen(true)}
            >
              <UserAvatar
                name={member.username}
                src={member.avatarUrl}
                size={32}
              />
            </div>
          ))
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 rounded-full border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
        >
          <PlusIcon size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 max-h-60 overflow-y-auto">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 text-center">
            Assigner des membres
          </h4>
          <div className="flex flex-col gap-1">
            {boardMembers.map((boardMember) => {
              const targetUserId = boardMember.userId || boardMember.id;
              const targetUsername =
                boardMember.user?.username || boardMember.username || "U";
              const targetAvatarUrl =
                boardMember.user?.avatarUrl || boardMember.avatarUrl;

              const isSelected = cardMembers.some((m) => m.id === targetUserId);

              return (
                <div
                  key={targetUserId}
                  onClick={() => toggleMember(boardMember)}
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={targetUsername}
                      src={targetAvatarUrl}
                      size={24}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {targetUsername}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckIcon
                      size={16}
                      className="text-[#EA580C]"
                      weight="bold"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardMembers;

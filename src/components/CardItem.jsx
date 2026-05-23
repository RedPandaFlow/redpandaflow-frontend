import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarBlank, TextAlignCenter } from "@phosphor-icons/react";

const CardItem = ({ card, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: card.id,
    data: { type: "Card", card } // Utile pour le drag & drop plus tard
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(card)}
      className="group relative flex cursor-grab flex-col gap-2 rounded-lg border border-[#EDE0D4] bg-white p-3 shadow-sm active:cursor-grabbing hover:border-orange-300"
    >
      <p className="text-sm font-medium text-[#1C1410]">{card.title}</p>
      
      {/* Affiche de petits icônes si la carte a une description ou une date */}
      {(card.description || card.dueDate) && (
        <div className="flex items-center gap-3 text-xs text-[#9C8170]">
          {card.description && <TextAlignCenter size={14} />}
          {card.dueDate && (
            <span className="flex items-center gap-1">
              <CalendarBlank size={14} />
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CardItem;
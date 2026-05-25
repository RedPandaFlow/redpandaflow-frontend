import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  TextAlignLeftIcon,
  CalendarBlankIcon,
  CheckSquareIcon,
} from "@phosphor-icons/react";

export default function CardItem({ card, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-50 bg-[#E6D5C3] border-2 border-dashed border-[#EA580C] rounded-lg p-3 min-h-15"
      />
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(card)}
      className="group bg-white p-3 rounded-lg shadow-sm hover:shadow border border-[#EDE0D4] hover:border-[#EA580C]/30 transition-all cursor-pointer mb-2"
    >
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => (
            <div
              key={label.id}
              className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs max-w-30 truncate"
              style={{ backgroundColor: label.color }}
              title={label.name}
            >
              {label.name}
            </div>
          ))}
        </div>
      )}

      <p className="text-sm font-medium text-[#1C1410]">{card.title}</p>

      {(card.description || card.dueDate || card.checklistItemsTotal > 0) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-[#9C8170]">
          {card.description && <TextAlignLeftIcon size={14} />}
          {card.dueDate && (
            <span className="flex items-center gap-1">
              <CalendarBlankIcon size={14} />
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          )}
          {card.checklistItemsTotal > 0 && (
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                card.checklistItemsDone === card.checklistItemsTotal
                  ? "bg-green-100 text-green-700"
                  : "bg-[#FDF3EA] text-[#7A6558]"
              }`}
            >
              <CheckSquareIcon size={12} weight="bold" />
              {card.checklistItemsDone}/{card.checklistItemsTotal}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

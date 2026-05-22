import { CaretDown, Kanban, Plus, UsersThree } from "@phosphor-icons/react";
import {
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "./ui/dropdown-menu";

const CreateMenu = ({ onCreateWorkspace }) => {
  return (
    <DropdownMenu
      align="end"
      trigger={
        <span className="flex items-center gap-1.5 rounded-lg bg-[#EA580C] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#C2410C]">
          <Plus size={16} weight="bold" />
          Créer
          <CaretDown size={14} />
        </span>
      }
    >
      <DropdownLabel>Créer</DropdownLabel>
      <DropdownItem icon={UsersThree} onClick={onCreateWorkspace}>
        Espace de travail
      </DropdownItem>
      <DropdownItem icon={Kanban} disabled hint="Bientôt">
        Tableau
      </DropdownItem>
    </DropdownMenu>
  );
};

export default CreateMenu;

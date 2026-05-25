import {
  CaretDownIcon,
  KanbanIcon,
  PlusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { DropdownItem, DropdownLabel, DropdownMenu } from "./ui/dropdown-menu";

const CreateMenu = ({ onCreateWorkspace, onCreateBoard }) => {
  return (
    <DropdownMenu
      align="end"
      trigger={
        <span className="flex items-center gap-1.5 rounded-lg bg-[#EA580C] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#C2410C]">
          <PlusIcon size={16} weight="bold" />
          Créer
          <CaretDownIcon size={14} />
        </span>
      }
    >
      <DropdownLabel>Créer</DropdownLabel>
      <DropdownItem icon={UsersThreeIcon} onClick={onCreateWorkspace}>
        Espace de travail
      </DropdownItem>
      <DropdownItem icon={KanbanIcon} onClick={onCreateBoard}>
        Tableau
      </DropdownItem>
    </DropdownMenu>
  );
};

export default CreateMenu;

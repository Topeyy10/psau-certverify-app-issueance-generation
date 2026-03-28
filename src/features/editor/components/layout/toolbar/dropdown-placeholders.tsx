import {
  IdCardIcon,
  PencilLineIcon,
  QrCodeIcon,
  TypeOutline,
  User2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PlaceholderVariant } from "@/features/editor/lib/types";
import { ToolButton } from "../../controls/tool-button";

const PlaceholderDropdown = ({
  onClick,
}: {
  onClick: (variant: PlaceholderVariant) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolButton
          title="Add Placeholder"
          variant="ghost"
          size="sm"
          className="size-8"
        >
          <TypeOutline className="size-4" strokeDasharray={3} />
        </ToolButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onClick("recipient")}>
          <User2Icon />
          Recipient
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onClick("qr-code")}>
          <QrCodeIcon />
          QR Code
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onClick("certificate-id")}>
          <IdCardIcon />
          Certificate ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onClick("custom")}>
          <PencilLineIcon />
          Custom
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { PlaceholderDropdown };

import {
  BanIcon,
  CircleIcon,
  CopyIcon,
  KeyIcon,
  MoreHorizontalIcon,
  ShieldUserIcon,
  UserIcon,
  UserStarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RowAction = ({
  id,
  role,
  isBanned,
  onStatusChangeRequest: setStatus,
  onRoleChangeRequest: setRole,
  onPasswordResetRequest,
}: {
  id: string;
  role: string;
  isBanned: boolean; // Current status
  onStatusChangeRequest: (status: boolean) => void; // Set intended *new* status (false=Ban, true=Unban)
  onRoleChangeRequest: (role: "admin" | "issuer" | "user") => void;
  onPasswordResetRequest: () => void;
}) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(id)}>
          <CopyIcon className="mr-2 size-4" />
          Copy User ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* Role Management */}
        {role !== "admin" && (
          <DropdownMenuItem onClick={() => setRole("admin")}>
            <ShieldUserIcon className="mr-2 size-4" />
            Set As Admin
          </DropdownMenuItem>
        )}
        {role !== "issuer" && (
          <DropdownMenuItem onClick={() => setRole("issuer")}>
            <UserStarIcon className="mr-2 size-4" />
            Set As Issuer
          </DropdownMenuItem>
        )}
        {role !== "user" && (
          <DropdownMenuItem onClick={() => setRole("user")}>
            <UserIcon className="mr-2 size-4" />
            Set As User
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />

        {/* Ban / Unban */}
        {isBanned ? (
          // Current status is BANNED, so offer UNBAN (intended new status: true)
          <DropdownMenuItem
            className="text-success focus:bg-success/10 dark:focus:bg-success/20 focus:text-success *:[svg]:!text-success"
            onClick={() => setStatus(true)}
          >
            <CircleIcon className="mr-2 size-4" />
            Unban User
          </DropdownMenuItem>
        ) : (
          // Current status is ACTIVE, so offer BAN (intended new status: false)
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setStatus(false)}
          >
            <BanIcon className="mr-2 size-4" />
            Ban User
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onPasswordResetRequest}>
          <KeyIcon className="mr-2 size-4" /> Reset Password
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { RowAction };

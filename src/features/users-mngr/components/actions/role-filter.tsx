"use client";

import { FilterIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUsersActions,
  useUsersState,
} from "../../lib/context/data-provider";

const RoleFilter = () => {
  const { role } = useUsersState();
  const { setRole } = useUsersActions();

  return (
    <Select value={role} onValueChange={setRole}>
      <SelectTrigger className="w-full sm:w-48">
        <FilterIcon className="mr-1 size-4" />
        <SelectValue placeholder="Filter by role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">All Roles</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="issuer">Issuer</SelectItem>
        <SelectItem value="user">User</SelectItem>
      </SelectContent>
    </Select>
  );
};

export { RoleFilter };

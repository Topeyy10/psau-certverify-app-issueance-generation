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
  useCertificatesActions,
  useCertificatesState,
} from "../../lib/context/data-provider";

const StatusFilter = () => {
  const { status } = useCertificatesState();
  const { setStatus } = useCertificatesActions();

  return (
    <Select value={status} onValueChange={setStatus}>
      <SelectTrigger className="w-full sm:w-48">
        <FilterIcon className="mr-1 size-4" />
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">All Statuses</SelectItem>
        <SelectItem value="1">Valid</SelectItem>
        <SelectItem value="0">Pending</SelectItem>
        <SelectItem value="-1">Revoked</SelectItem>
      </SelectContent>
    </Select>
  );
};

export { StatusFilter };

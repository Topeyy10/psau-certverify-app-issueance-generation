"use client";

import { SearchIcon } from "lucide-react";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useUsersActions } from "../../lib/context/data-provider";

const SearchBar = () => {
  const { setSearch } = useUsersActions();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (!value.trim()) {
        setSearch("");
      } else {
        setSearch(value.trim());
      }
    },
    [setSearch],
  );

  return (
    <div className="group relative w-full">
      <Input
        className="w-full pl-7"
        placeholder="Search by User ID or Role"
        onChange={handleInputChange}
        type="text"
      />
      <SearchIcon className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-2 size-4 -translate-y-1/2" />
    </div>
  );
};

export { SearchBar };

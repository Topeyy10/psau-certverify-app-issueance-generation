import { RoleFilter, SearchBar, UsersTableContent } from "./components";
import { DataProvider } from "./lib/context/data-provider";

const UserManager = () => {
  return (
    <DataProvider>
      <div className="space-y-4">
        <div className="flex sm:items-center sm:space-x-4 flex-col sm:flex-row space-y-3 sm:space-y-0">
          <SearchBar />
          <RoleFilter />
        </div>
        <UsersTableContent />
      </div>
    </DataProvider>
  );
};

export { UserManager };

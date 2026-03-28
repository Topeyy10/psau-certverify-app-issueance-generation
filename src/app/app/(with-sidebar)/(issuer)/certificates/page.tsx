import { Separator } from "@/components/ui/separator";
import {
  BulkActions,
  CertificatesProvider,
  CertificatesTableContent,
  SearchBar,
  StatusFilter,
  TablePagination,
} from "@/features/issuance";

const IssuancePage = () => {
  return (
    <CertificatesProvider>
      <div className="space-y-4">
        <div className="flex sm:items-center sm:space-x-4 flex-col sm:flex-row space-y-3 sm:space-y-0">
          <SearchBar />
          <StatusFilter />
        </div>
        <BulkActions />
        <CertificatesTableContent />
        <Separator />
        <TablePagination />
      </div>
    </CertificatesProvider>
  );
};

export default IssuancePage;

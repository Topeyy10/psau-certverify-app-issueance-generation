import { ShieldCheckIcon } from "lucide-react";
import { SectionContainer } from "../../components";
import {
  ResultsDialog,
  ScanMethod,
  SearchMethod,
  UploadMethod,
} from "./components";

const Verification = () => {
  return (
    <>
      <SectionContainer
        id="verification"
        title="Choose Your Verification Method"
        subtitle="Multiple convenient ways to verify your certificates with enterprise-grade security"
        badgeIcon={ShieldCheckIcon}
        badgeText="Three Verification Methods"
      >
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-3">
          <UploadMethod />
          <ScanMethod />
          <SearchMethod />
        </div>
      </SectionContainer>
      <ResultsDialog />
    </>
  );
};

export { Verification };

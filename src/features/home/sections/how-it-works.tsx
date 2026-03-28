import { WrenchIcon } from "lucide-react";
import { getKeyIndex } from "@/lib/utils";
import { SectionContainer, StepCard } from "../components";
import { ProcessItems } from "../constants/process-data";

const HowItWorks = () => {
  return (
    <SectionContainer
      id="how-it-works"
      title="How It Works"
      subtitle="Three simple steps to verify any certificate files from PSAU"
      badgeIcon={WrenchIcon}
      badgeText="Simple Process"
    >
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-3">
        {ProcessItems.map((step, index) => (
          <StepCard key={getKeyIndex()} {...{ ...step, index }} />
        ))}
      </div>
    </SectionContainer>
  );
};

export { HowItWorks };

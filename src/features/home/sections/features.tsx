import { StarIcon } from "lucide-react";
import { getKeyIndex } from "@/lib/utils";
import { FeatureCard, SectionContainer } from "../components";
import { FeatureItems } from "../constants/features-data";

const Features = () => {
  return (
    <SectionContainer
      id="features"
      title="Why Choose PSAU CertVerify"
      subtitle="Advanced features designed for reliable and secure certificate verification"
      badgeIcon={StarIcon}
      badgeText="Great Features"
    >
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {FeatureItems.map((feature) => (
          <FeatureCard key={getKeyIndex()} {...feature} />
        ))}
      </div>
    </SectionContainer>
  );
};

export { Features };

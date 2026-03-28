import { CardWrapper } from "@/components/shared/card-wrapper";
import { MAPPINGS_META } from "../../lib/constants";

interface SettingsCardProps {
  group: keyof typeof MAPPINGS_META;
  children: React.ReactNode;
  className?: string;
}

const MappingCardWrapper = (props: SettingsCardProps) => (
  <CardWrapper meta={MAPPINGS_META} {...props} />
);

export { MappingCardWrapper };

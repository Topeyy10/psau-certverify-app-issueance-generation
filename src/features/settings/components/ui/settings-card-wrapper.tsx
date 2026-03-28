import { CardWrapper } from "@/components/shared/card-wrapper";
import { SETTINGS_META } from "../../lib/constants/settings";

interface SettingsCardProps {
  group: keyof typeof SETTINGS_META;
  children: React.ReactNode;
  className?: string;
}

const SettingsCard = (props: SettingsCardProps) => (
  <CardWrapper meta={SETTINGS_META} {...props} />
);

export { SettingsCard };

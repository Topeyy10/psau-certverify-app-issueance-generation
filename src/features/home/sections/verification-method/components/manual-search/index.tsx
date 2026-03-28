import { CreditCardIcon } from "lucide-react";
import { Card } from "../shared/card";
import { SearchSlot } from "./search-slot";

const SearchMethod = () => {
  return (
    <Card
      icon={CreditCardIcon}
      title="Manual ID Input"
      description="Enter your certificate ID manually for quick verification"
    >
      <SearchSlot />
    </Card>
  );
};

export { SearchMethod };

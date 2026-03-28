import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Mappings = () => {
  return (
    <Alert>
      <AlertCircleIcon />
      <AlertTitle>Pick a Template to Continue</AlertTitle>
      <AlertDescription>
        You must select a template from the template manager on your dashboard
        before you can proceed. You may have landed here by mistake without a
        template selected.
      </AlertDescription>
    </Alert>
  );
};

export default Mappings;

import { ClockIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const ADMIN_EMAIL = "admin@yourcompany.com";
const ADMIN_PHONE = "123-456-7890";
const REVIEW_TIMELINE = "less than 24 hours";

const UserDashboard = () => {
  return (
    <div>
      <div className="space-y-3">
        <p className="font-medium">
          Your account has been successfully created and is now in a{" "}
          <span className="font-bold">pending state</span>.
        </p>
        <p className="text-sm text-muted-foreground">
          An administrator is currently reviewing your registration to determine
          the most appropriate user role and permissions for you.
        </p>

        <Alert>
          <ClockIcon />
          <AlertTitle>Review Time</AlertTitle>
          <AlertDescription>
            This process typically takes {REVIEW_TIMELINE}
          </AlertDescription>
        </Alert>

        <h3 className="text-xl font-semibold">What you can do now:</h3>

        <div className="space-y-2">
          <p className="font-semibold">1. Wait for Access</p>
          <p className="text-sm text-muted-foreground ml-4">
            There is <span className="italic">no action required</span> from
            your side. Once the administrator verifies your account and assigns
            your role,{" "}
            <span className="italic">
              your dashboard will automatically unlock
            </span>
            , granting you full access to all components and features.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <p className="font-semibold">2. Contact an Admin (If Urgent)</p>
          <div className="flex flex-wrap items-center gap-3 ml-4">
            <p className="text-sm text-muted-foreground">
              If you require immediate access, please reach out directly to the
              admins
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-5">
        <Separator />
        <p className="absolute text-sm w-fit left-1/2 -translate-1/2 bg-background top-1/2 px-10 text-muted-foreground">
          Thank you for your patience! We look forward to seeing you inside.
        </p>
      </div>
    </div>
  );
};

export { UserDashboard };

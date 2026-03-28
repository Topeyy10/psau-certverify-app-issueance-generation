import { verifyEmail } from "@/aactions/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const VerifyPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; secret?: string }>;
}) => {
  const { userId, secret } = await searchParams;

  if (!userId || !secret) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription className="text-destructive">
              Invalid verification link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  let result;
  try {
    result = await verifyEmail(userId, secret);
  } catch {
    result = { ok: false, error: "Unexpected error verifying email." };
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription
            className={result.ok ? "text-green-600" : "text-destructive"}
          >
            {result.ok
              ? "Email verified successfully."
              : result.error || "Failed to verify email."}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default VerifyPage;

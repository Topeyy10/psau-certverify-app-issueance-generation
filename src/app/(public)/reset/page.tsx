import { ResetForm } from "@/features/password-reset";

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; secret?: string }>;
}) => {
  const { userId, secret } = await searchParams;

  if (!userId || !secret) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <p className="text-destructive text-center">Invalid recovery link.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <ResetForm userId={userId} secret={secret} />
    </div>
  );
};

export default ResetPasswordPage;

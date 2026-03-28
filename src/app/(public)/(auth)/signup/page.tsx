import { AuthCard, AuthFooter, AuthHeader, SignupForm } from "@/features/auth";

const SignupPage = () => (
  <>
    <AuthHeader
      title="Create an Account"
      subtitle="Join Us Today! Enter your details to get started"
    />

    <AuthCard>
      <SignupForm />
    </AuthCard>

    <AuthFooter
      text="Already have an account?"
      linkHref="/login"
      linkText="Log In"
    />
  </>
);

export default SignupPage;

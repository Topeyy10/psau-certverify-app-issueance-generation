import { AuthCard, AuthFooter, AuthHeader, LoginForm } from "@/features/auth";

const LoginPage = () => (
  <>
    <AuthHeader
      title="Login to your account!"
      subtitle="Welcome Back! Please enter your details."
    />

    <AuthCard>
      <LoginForm />
    </AuthCard>

    <AuthFooter
      text="Don't have an account?"
      linkHref="/signup"
      linkText="Sign Up"
    />
  </>
);

export default LoginPage;

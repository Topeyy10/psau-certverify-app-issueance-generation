"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { loginWithEmail } from "@/aactions/auth/login.action";
import { LoadingButton } from "@/components/shared/loading-button";
import { PasswordInput } from "@/components/shared/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToastStore } from "@/stores/toast-store";
import { type LoginFormData, loginSchema } from "../schema/login-schema";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const { start, stop, error } = useToastStore(
    useShallow((s) => ({
      start: s.start,
      stop: s.stopSuccess,
      error: s.stopError,
    })),
  );

  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleLogin = useCallback(
    async (data: LoginFormData) => {
      setLoading(true);

      try {
        start("Logging in...");
        const result = await loginWithEmail(data);

        if (result) {
          if (result.ok) {
            stop("Login successfully");
            router.push("/app/dashboard");
          } else {
            throw result.error;
          }
        }
      } catch (err: unknown) {
        let message = "Unexpected error ocurred";
        if ((err as string).includes("The current user has been blocked.")) {
          message =
            "This account has been suspended and cannot log in. For assistance, please contact your administrator.";
        } else {
          message = err as string;
        }
        error(message);
      } finally {
        setLoading(false);
        form.reset();
      }
    },
    [form, router, start, stop, error],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)} noValidate>
        <fieldset className="space-y-5" disabled={loading}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john_doe@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    autoComplete="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-4">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Remember Me?
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* TODO Uncomment when email verification proceeds
            <a
              href="#"
              className={cn(
                "text-muted-foreground text-sm hover:text-foreground hover:underline",
                loading && "pointer-events-none opacity-50 cursor-not-allowed",
              )}
            >
              Forgot your password
            </a> */}
          </div>

          <LoadingButton
            className="w-full"
            label="Log In"
            loading={loading}
            loadingLabel="Authenticating..."
            size="lg"
          />
        </fieldset>
      </form>
    </Form>
  );
};

export { LoginForm };

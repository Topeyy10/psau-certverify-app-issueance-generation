"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";
import { signupWithEmail } from "@/aactions/auth";
import { LoadingButton } from "@/components/shared/loading-button";
import { PasswordInput } from "@/components/shared/password-input";
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
import { PasswordRuleDisplay } from "../components/password-rules";
import { type SignupFormData, signupSchema } from "../schema/signup-schema";

const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const { start, stop, error } = useToastStore(
    useShallow((s) => ({
      start: s.start,
      stop: s.stopSuccess,
      error: s.stopError,
    })),
  );

  const router = useRouter();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignup = useCallback(
    async (data: SignupFormData) => {
      setLoading(true);
      try {
        start("Creating account...");
        const result = await signupWithEmail(data);

        if (result) {
          if (result.ok) {
            stop("Account created successfully");
            router.push("/login");
          } else {
            throw new Error(result.error);
          }
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unexpected error occured";
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
      <form onSubmit={form.handleSubmit(handleSignup)} noValidate>
        <fieldset className="space-y-5" disabled={loading}>
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="items-start -space-y-1">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    type="string"
                    placeholder="John Doe"
                    maxLength={128}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="items-start -space-y-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john_doe@example.com"
                    maxLength={100}
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
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <PasswordRuleDisplay control={form.control} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="-space-y-1">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    maxLength={128}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <LoadingButton
            className="w-full"
            label="Create Account"
            loading={loading}
            loadingLabel="Creating account..."
            size="lg"
          />
        </fieldset>
      </form>
    </Form>
  );
};

export { SignupForm };

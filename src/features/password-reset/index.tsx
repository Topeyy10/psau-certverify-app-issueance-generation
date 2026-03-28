"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { resetUserPassword } from "@/aactions/auth";
import { LoadingButton } from "@/components/shared/loading-button";
import { PasswordInput } from "@/components/shared/password-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type ResetFormValues, resetSchema } from "./form-schema";

const ResetForm = ({ userId, secret }: { userId: string; secret: string }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: ResetFormValues) => {
    startTransition(async () => {
      const result = await resetUserPassword(userId, secret, values.password);

      if (result.ok) {
        setSuccess(true);
        setMessage("Password reset successful. You may now log in.");
      } else {
        setSuccess(false);
        setMessage(result.error ?? "Failed to reset password.");
      }
    });
  };
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
      </CardHeader>
      <CardContent>
        {success ? (
          <p className="text-center text-green-600">
            Password reset successful. You may now log in.
          </p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormMessage className="text-xs" />
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

              {message && (
                <p
                  className={`text-sm ${success ? "text-green-600" : "text-destructive"}`}
                >
                  {message}
                </p>
              )}

              <LoadingButton
                className="w-full"
                label="Reset Password"
                loading={isPending}
                loadingLabel="Resetting password..."
                size="lg"
              />
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export { ResetForm };

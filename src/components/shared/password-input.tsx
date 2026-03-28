"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {}

const PasswordInput = React.memo(
  React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, disabled, maxLength = 128, ...props }, ref) => {
      const [isVisible, setIsVisible] = useState(false);

      const toggleVisibility = useCallback(() => {
        if (!disabled) setIsVisible((prev) => !prev);
      }, [disabled]);

      return (
        <div className="relative">
          <Input
            ref={ref}
            className={cn("pr-10", className)}
            type={isVisible ? "text" : "password"}
            disabled={disabled}
            maxLength={maxLength}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={toggleVisibility}
            disabled={disabled}
            aria-label={isVisible ? "Hide password" : "Show password"}
            className="text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors disabled:opacity-50"
          >
            {isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>
      );
    },
  ),
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };

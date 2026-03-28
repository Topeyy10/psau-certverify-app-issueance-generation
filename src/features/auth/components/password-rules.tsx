import { CheckIcon, XIcon } from "lucide-react";
import { type Control, useWatch } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { PASSWORD_RULES } from "@/constants";
import { cn } from "@/lib/utils";
import type { SignupFormData } from "../schema/signup-schema";

interface PasswordRuleDisplayProps {
  control: Control<SignupFormData>;
}

const PasswordRuleDisplay = ({ control }: PasswordRuleDisplayProps) => {
  const password = useWatch({ control, name: "password" }) || "";

  const rules = Object.entries(PASSWORD_RULES).map(([key, rule]) => ({
    label: rule.message,
    valid:
      key === "length"
        ? password.length >= rule.min
        : rule.regex.test(password),
  }));

  return (
    <div className="mt-2 space-y-1 text-xs">
      {rules.map((rule) => (
        <div
          key={uuidv4()}
          className={cn(
            "flex items-center gap-2",
            rule.valid
              ? "text-green-800 dark:text-green-400"
              : "text-muted-foreground",
          )}
        >
          <span aria-hidden="true">
            {rule.valid ? <CheckIcon size={16} /> : <XIcon size={16} />}
          </span>
          <span>{rule.label}</span>
        </div>
      ))}
    </div>
  );
};

export { PasswordRuleDisplay };

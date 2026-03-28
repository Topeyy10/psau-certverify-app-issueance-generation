"use client";

import { SaveIcon } from "lucide-react";
import { memo } from "react";
import { type Control, type FieldValues, useFormState } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaveButtonProps<T extends FieldValues>
  extends Omit<React.ComponentProps<typeof Button>, "children"> {
  control: Control<T>;
  loading: boolean;
}

const SaveButtonComponent = <T extends FieldValues>(
  props: SaveButtonProps<T>,
) => {
  const { control, loading = false, className, disabled, ...rest } = props;
  const { isDirty } = useFormState({ control });

  return (
    <Button
      className={cn("w-full", className)}
      disabled={disabled || loading || !isDirty}
      {...rest}
    >
      <SaveIcon />
      Save Changes
    </Button>
  );
};

const SaveButton = memo(SaveButtonComponent) as typeof SaveButtonComponent;

export { SaveButton };

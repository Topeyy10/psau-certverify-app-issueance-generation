import { memo, useCallback } from "react";
import type {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
  showError?: boolean;
  errorPosition?: "top" | "bottom" | "label";
  children: (
    field: ControllerRenderProps<T, FieldPath<T>>,
  ) => React.ReactElement;
}

const FormInputComponent = <T extends FieldValues>(
  props: FormInputProps<T>,
) => {
  const {
    control,
    name,
    label,
    description,
    className,
    showError = true,
    errorPosition = "bottom",
    children,
  } = props;

  const renderError = useCallback(() => {
    if (showError) {
      return <FormMessage className="text-xs" />;
    } else {
      return null;
    }
  }, [showError]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="-space-y-1">
          <div className={className}>
            <div className="flex-1">
              {label && <FormLabel>{label}</FormLabel>}
              {description && (
                <FormDescription className="leading-snug">
                  {description}
                </FormDescription>
              )}
              {errorPosition === "label" && renderError()}
            </div>
            {errorPosition === "top" && renderError()}
            <FormControl>{children(field)}</FormControl>
            {errorPosition === "bottom" && renderError()}
          </div>
        </FormItem>
      )}
    />
  );
};

const FormFieldComponent = memo(
  FormInputComponent,
) as typeof FormInputComponent;

export { FormFieldComponent as FormField };

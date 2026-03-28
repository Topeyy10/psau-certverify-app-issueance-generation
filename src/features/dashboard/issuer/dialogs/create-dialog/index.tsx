import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useCallback } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PAPER_SIZE_MAP } from "@/features/dashboard/shared/constants/paper";
import { type TemplateFormType, templateFormSchema } from "./create.schema";

// Memoized form fields to prevent unnecessary rerenders
const TemplateNameField = memo<{ form: UseFormReturn<TemplateFormType> }>(
  ({ form }) => (
    <FormField
      control={form.control}
      name="name"
      label="Template Name"
      className="space-y-1"
    >
      {({ value, onChange, ...field }) => (
        <Input
          type="text"
          placeholder="Enter template name"
          value={String(value)}
          onChange={onChange}
          {...field}
        />
      )}
    </FormField>
  ),
);
TemplateNameField.displayName = "TemplateNameField";

const PaperSizeField = memo(
  ({ form }: { form: UseFormReturn<TemplateFormType> }) => (
    <FormField
      control={form.control}
      name="paperSize"
      label="Paper Size"
      className="space-y-1"
    >
      {({ value, onChange, ...field }) => (
        <Select value={String(value)} onValueChange={onChange} {...field}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select paper size" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PAPER_SIZE_MAP).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label.label} {label.labelSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  ),
);
PaperSizeField.displayName = "PaperSizeField";

const OrientationField = memo(
  ({ form }: { form: UseFormReturn<TemplateFormType> }) => (
    <FormField control={form.control} name="isPortrait" label="Orientation">
      {({ value, onChange, ...field }) => (
        <ToggleGroup
          variant="outline"
          type="single"
          className="w-full"
          value={String(value)}
          onValueChange={(v) =>
            onChange(v === "true" ? true : v === "false" ? false : null)
          }
          {...field}
        >
          <ToggleGroupItem value="true" className="flex-1">
            Portrait
          </ToggleGroupItem>
          <ToggleGroupItem value="false" className="flex-1">
            Landscape
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </FormField>
  ),
);
OrientationField.displayName = "OrientationField";

/** Main component */
interface CreateTemplateDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: TemplateFormType) => void;
}

const CreateTemplateDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: CreateTemplateDialogProps) => {
  const form = useForm<TemplateFormType>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      paperSize: "a4",
      isPortrait: false,
    },
    mode: "onChange",
  });

  const handleClose = useCallback(() => {
    form.reset();
    onOpenChange?.(false);
  }, [form, onOpenChange]);

  const handleSubmit = useCallback(
    (data: TemplateFormType) => {
      const cleanedData = {
        ...data,
        templateName: data.name.trim(),
      };

      onSubmit?.(cleanedData);
      handleClose();
    },
    [onSubmit, handleClose],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Template</DialogTitle>
          <DialogDescription>
            Configure a new template and save to reuse for future issuance.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <TemplateNameField form={form} />
            <PaperSizeField form={form} />
            <OrientationField form={form} />

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { CreateTemplateDialog };

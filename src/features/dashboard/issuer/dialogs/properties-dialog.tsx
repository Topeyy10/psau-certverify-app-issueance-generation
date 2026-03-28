import { Dialog } from "@radix-ui/react-dialog";
import {
  Clock3Icon,
  Clock8Icon,
  FileIcon,
  FileTextIcon,
  IdCardIcon,
  type LucideIcon,
  RatioIcon,
} from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  cn,
  formatToReadableTimestamp,
  formatToRelativeTimestamp,
} from "@/lib/utils";
import type { Template, TemplateId } from "@/types";

const PropertyRow = memo<{
  icon: LucideIcon;
  label: string;
  value?: string;
  className?: string;
  children?: React.ReactNode;
}>((props) => {
  const { icon: Icon, label, value, className, children } = props;

  return (
    <>
      <div className="flex items-center gap-2">
        <Icon className="size-4 hidden sm:block" /> <span>{label}</span>
      </div>
      {children ? (
        <div className="mb-2 sm:mb-0">{children}</div>
      ) : (
        <span
          className={cn(
            "text-muted-foreground line-clamp-2 break-all mb-2 sm:mb-0",
            className,
          )}
        >
          {value}
        </span>
      )}
    </>
  );
});
PropertyRow.displayName = "Property";

const PropertiesDialog = memo<
  React.ComponentProps<typeof Dialog> & {
    selectedTemplate: Template | null;
    onUse: (id: TemplateId) => void;
  }
>((props) => {
  const { selectedTemplate: template, onUse, open, ...rest } = props;

  const handleTemplateUse = useCallback(() => {
    if (template?.id) {
      onUse(template.id);
      rest.onOpenChange?.(false);
    }
  }, [template?.id, onUse, rest.onOpenChange]);

  const timestamps = useMemo(() => {
    if (!template) return null;

    return {
      created: {
        readable: formatToReadableTimestamp(template.meta.date_created),
        relative: formatToRelativeTimestamp(template.meta.date_created),
      },
      modified: {
        readable: formatToReadableTimestamp(template.meta.date_modified),
        relative: formatToRelativeTimestamp(template.meta.date_modified),
      },
    };
  }, [template?.meta.date_created, template?.meta.date_modified, template]);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={handleTemplateUse} {...rest}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Template Properties</DialogTitle>
          <DialogDescription>
            Detailed information about this certificate template.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[350px] pr-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-start gap-x-2 lg:gap-x-4 sm:gap-y-3 text-sm">
            <PropertyRow
              icon={IdCardIcon}
              label="Template ID"
              value={template.id}
            />
            <PropertyRow
              icon={FileTextIcon}
              label="Name"
              value={template.name}
            />
            <PropertyRow icon={Clock3Icon} label="Created">
              <div>
                <p className="text-muted-foreground line-clamp-2 break-all">
                  {timestamps?.created.readable}
                </p>
                <p className="text-muted-foreground line-clamp-2 break-all">
                  ({timestamps?.created.relative})
                </p>
              </div>
            </PropertyRow>

            <PropertyRow icon={Clock8Icon} label="Modified">
              <div>
                <p className="text-muted-foreground line-clamp-2 break-all">
                  {timestamps?.modified.readable}
                </p>
                <p className="text-muted-foreground line-clamp-2 break-all">
                  ({timestamps?.modified.relative})
                </p>
              </div>
            </PropertyRow>

            <PropertyRow
              icon={FileIcon}
              label="Paper Size"
              value={template.meta.size.paper}
              className="capitalize"
            />

            <PropertyRow
              icon={RatioIcon}
              label="Orientation"
              value={template.meta.isPortrait ? "portrait" : "landscape"}
              className="capitalize"
            />
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button onClick={handleTemplateUse}>Use Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
PropertiesDialog.displayName = "PropertiesDialog";

export { PropertiesDialog };

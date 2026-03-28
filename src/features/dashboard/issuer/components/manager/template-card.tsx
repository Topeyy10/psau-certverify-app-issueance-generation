import {
  ClockIcon,
  EditIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PlayIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatToReadableTimestamp,
  formatToRelativeTimestamp,
} from "@/lib/utils";
import type { Template, TemplateActions, TemplateMeta } from "@/types";

const TemplateImage = memo<{ src: string; alt: string }>(({ src, alt }) => (
  <Image
    width={400}
    height={300}
    draggable={false}
    className="bg-secondary border-b aspect-[4/3] h-auto w-full object-cover object-top text-sm"
    src={src}
    alt={alt}
    loading="lazy"
  />
));
TemplateImage.displayName = "Template Image";

const TemplateTitle = memo<{ title: string }>(({ title }) => (
  <Tooltip>
    <TooltipTrigger className="w-fit text-left">
      <p className="line-clamp-1 leading-none font-semibold">{title}</p>
    </TooltipTrigger>
    <TooltipContent>{title}</TooltipContent>
  </Tooltip>
));
TemplateTitle.displayName = "Title";

const TemplateMetadata = memo<
  Pick<TemplateMeta, "date_created" | "date_modified">
>(({ date_created, date_modified }) => (
  <div className="text-muted-foreground flex items-center gap-3 text-xs">
    <div className="flex flex-shrink-0 items-center gap-1">
      <ClockIcon className="size-3 flex-none" />
      <span>{formatToReadableTimestamp(date_created, "short")}</span>
    </div>
    <span>&bull;</span>
    <span className="flex flex-shrink-0">{`Modified ${formatToRelativeTimestamp(date_modified)}`}</span>
  </div>
));
TemplateMetadata.displayName = "TemplateMeta";

const TemplateDropdownMenu = memo<{
  onUseTemplate: () => void;
  onEditTemplate: () => void;
  onViewProperties: () => void;
  onDeleteTemplate: () => void;
}>(({ onUseTemplate, onEditTemplate, onViewProperties, onDeleteTemplate }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button type="button">
        <MoreHorizontalIcon className="size-4" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={onUseTemplate}>
        <PlayIcon />
        Use Template
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onEditTemplate}>
        <EditIcon />
        Edit Template
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onViewProperties}>
        <EyeIcon />
        View Properties
      </DropdownMenuItem>
      <DropdownMenuItem variant="destructive" onClick={onDeleteTemplate}>
        <Trash2Icon />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));
TemplateDropdownMenu.displayName = "TemplateDropdownMenu";

const TemplateQuickActions = memo<{
  onUseTemplate: () => void;
  onEditTemplate: () => void;
}>(({ onUseTemplate, onEditTemplate }) => (
  <div className="flex items-center gap-3">
    <Button className="flex-1" onClick={onUseTemplate}>
      Use Template
    </Button>
    <Button variant="outline" onClick={onEditTemplate}>
      Edit
    </Button>
  </div>
));
TemplateQuickActions.displayName = "TemplateQuickActions";

// Main component
const TemplateCard = memo<TemplateActions & { template: Template }>(
  ({
    onUseTemplate,
    onEditTemplate,
    onViewProperties,
    onDeleteTemplate,
    template,
  }) => {
    const { id, meta, name, preview } = template;
    const { date_created, date_modified } = meta;

    const handleUseTemplate = useCallback(() => {
      onUseTemplate?.(id);
    }, [id, onUseTemplate]);

    const handleEditTemplate = useCallback(() => {
      onEditTemplate?.(id);
    }, [id, onEditTemplate]);

    const handleViewProperties = useCallback(() => {
      onViewProperties?.(id);
    }, [id, onViewProperties]);

    const handleDeleteTemplate = useCallback(() => {
      onDeleteTemplate?.(id);
    }, [id, onDeleteTemplate]);

    return (
      <div className="w-full h-full">
        <div className="bg-card h-full text-card-foreground flex flex-col overflow-hidden rounded-xl border shadow-sm">
          <TemplateImage
            src={`/api/templates/cover/${preview}`}
            alt={`${name} preview`}
          />
          <div className="flex flex-col gap-2">
            <div className="flex flex-1 flex-col justify-between gap-4 p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <TemplateTitle title={name} />
                  <TemplateMetadata
                    date_modified={date_modified}
                    date_created={date_created}
                  />
                </div>

                <TemplateDropdownMenu
                  onUseTemplate={handleUseTemplate}
                  onEditTemplate={handleEditTemplate}
                  onViewProperties={handleViewProperties}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              </div>

              <TemplateQuickActions
                onUseTemplate={handleUseTemplate}
                onEditTemplate={handleEditTemplate}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
TemplateCard.displayName = "TemplateCard";

export { TemplateCard };

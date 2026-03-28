import { BugIcon, Loader2Icon, PackageOpenIcon } from "lucide-react";
import { memo, useCallback, useState } from "react";
import type { Template, TemplatesResponse } from "@/aactions/shared/types";
import { Button } from "@/components/ui/button";
import type { TemplateActions, TemplateId } from "@/types";
import { PropertiesDialog } from "../../dialogs";
import { TemplateCard } from "./template-card";

const TemplateLoadError = memo<{
  error: string;
  refetch: () => void;
}>(({ error, refetch }) => (
  <div className="mx-auto my-5 max-w-sm space-y-2 text-center">
    <BugIcon className="mx-auto size-(--text-6xl)" />
    <p className="text-2xl font-bold">Oops, something went wrong.</p>
    <p className="text-muted-foreground text-sm">{error}</p>
    <Button size="sm" className="mt-5" onClick={refetch}>
      Try Again
    </Button>
  </div>
));
TemplateLoadError.displayName = "TemplateLoadEditor";

const TemplateLoader = memo(() => (
  <div className="mx-auto my-5 max-w-sm space-y-2 text-center">
    <Loader2Icon className="mx-auto size-(--text-6xl) animate-spin" />
    <p className="text-muted-foreground">Loading Templates</p>
  </div>
));
TemplateLoader.displayName = "Loader";

const NoTemplatesBlock = memo(() => (
  <div className="mx-auto my-5 max-w-sm space-y-2 text-center">
    <PackageOpenIcon className="mx-auto size-(--text-6xl)" />
    <p className="text-2xl font-bold">No Templates Available</p>
  </div>
));
NoTemplatesBlock.displayName = "NoTemplatesBlock";

const TemplateGrid = (
  props: Omit<TemplateActions, "onViewProperties"> & {
    data: TemplatesResponse | null;
    error: string | null;
    refetch: () => void;
  },
) => {
  const {
    data,
    error,
    refetch,
    onEditTemplate,
    onDeleteTemplate,
    onUseTemplate,
  } = props;

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [showProperties, setShowProperties] = useState(false);

  const getSelectedTemplate = useCallback(
    (id: TemplateId) => {
      if (!data?.templates) return null;
      return data.templates.find((t) => t.id === id) ?? null;
    },
    [data],
  );

  const handleViewProperties = useCallback(
    (id: TemplateId) => {
      const selected = getSelectedTemplate(id);
      if (selected) {
        setSelectedTemplate(selected);
        setShowProperties(true);
      }
    },
    [getSelectedTemplate],
  );

  if (error) return <TemplateLoadError error={error} refetch={refetch} />;

  if (!data) return <TemplateLoader />;

  return (
    <>
      {data.templates.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUseTemplate={onUseTemplate}
              onEditTemplate={onEditTemplate}
              onViewProperties={handleViewProperties}
              onDeleteTemplate={onDeleteTemplate}
            />
          ))}
        </div>
      ) : (
        <NoTemplatesBlock />
      )}

      <PropertiesDialog
        open={showProperties}
        onOpenChange={(o) => !o && setShowProperties(o)}
        selectedTemplate={selectedTemplate}
        onUse={onUseTemplate}
      />
    </>
  );
};

export { TemplateGrid };

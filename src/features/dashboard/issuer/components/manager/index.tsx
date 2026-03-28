"use client";

import axios from "axios";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { Template } from "@/aactions/shared/types";
import { deleteTemplateById } from "@/aactions/template";
import { Button } from "@/components/ui/button";
import { PAPER_SIZE_MAP } from "@/features/dashboard/shared/constants/paper";
import { useRefreshStore } from "@/features/dashboard/shared/stores/refresh-store";
import { useTemplateStore } from "@/features/editor/lib/stores";
import { useToastStore } from "@/stores/toast-store";
import type { TemplateData, TemplateId } from "@/types";
import { CreateTemplateDialog, DeleteDialog } from "../../dialogs";
import type { TemplateFormType } from "../../dialogs/create-dialog/create.schema";
import { TemplateGrid } from "./template-grid";

export const Header = ({
  onCreateTemplate,
}: {
  onCreateTemplate: () => void;
}) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h3 className="text-2xl font-bold">Active Templates</h3>
        <p className="text-muted-foreground mt-1">
          Create and manage your certificate templates
        </p>
      </div>
      <Button size="lg" onClick={onCreateTemplate}>
        <PlusIcon /> Create New Template
      </Button>
    </div>
  );
};
Header.displayName = "TemplateManagerHeader";

const TemplateManager = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const router = useRouter();

  const { start, stop, error } = useToastStore(
    useShallow((s) => ({
      start: s.start,
      stop: s.stopSuccess,
      error: s.stopError,
    })),
  );

  const [data, setData] = useState<TemplateData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAllTemplates = useCallback(async () => {
    setData(null);
    setErrorMessage(null);
    axios
      .get("/api/templates")
      .then((res) => {
        setData(res.data);
        setErrorMessage(null);
      })
      .catch((err: unknown) => {
        const message =
          axios.isAxiosError(err) && err.response?.data
            ? String(err.response.data)
            : err instanceof Error
              ? err.message
              : "Failed to fetch templates";

        setData(null);
        setErrorMessage(message);
      });
  }, []);

  useEffect(() => {
    fetchAllTemplates();
  }, [fetchAllTemplates]);

  const handleCreateTemplate = useCallback(
    (template: TemplateFormType) => {
      const { setName, setSize, setMeta, setId, setJsonId } =
        useTemplateStore.getState();
      const size = PAPER_SIZE_MAP[template.paperSize];

      const isPortrait = template.isPortrait;
      const w = isPortrait ? size.width : size.height;
      const h = isPortrait ? size.height : size.width;

      setName(template.name);
      setSize(w, h, size.label);
      setMeta({
        isPortrait: template.isPortrait,
      });
      setId(null);
      setJsonId(null);

      router.push("/app/editor");
      start("Creating new template...");
    },
    [router, start],
  );

  const handleUseTemplate = useCallback(
    (id: TemplateId) => {
      if (!id || !data) return;
      const selected = data.templates.filter((t) => t.id === id)[0];
      if (selected) {
        router.push(`/app/mapping/${selected.json}`);
        start("Loading Template");
      }
    },
    [data, router, start],
  );
  const handleEditTemplate = useCallback(
    (id: TemplateId) => {
      if (!id || !data) return;
      const selected = data.templates.filter((t) => t.id === id)[0];

      if (selected) {
        const { setName, setSize, setMeta, setId, setJsonId } =
          useTemplateStore.getState();

        setId(selected.id);
        setJsonId(selected.json);
        setName(selected.name);

        const size = selected.meta.size;
        setSize(size.w, size.h, size.paper);
        setMeta(selected.meta);

        router.push("/app/editor");
        start("Loading Template");
      }
    },
    [data, router, start],
  );
  const handleDeleteTemplate = useCallback(
    (id: TemplateId) => {
      if (!data) return;
      const selected = data.templates.filter((t) => t.id === id)[0];
      if (selected) {
        setSelectedTemplate(selected);
        setShowDelete(true);
      }
    },
    [data],
  );

  const deleteConfirm = useCallback(async () => {
    if (!selectedTemplate) return;
    try {
      start("Deleting Template");
      await deleteTemplateById(selectedTemplate.id);

      stop("Deleted successfully");
      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          templates: prev.templates.filter((t) => t.id !== selectedTemplate.id),
        };
      });

      useRefreshStore.getState().bump();
    } catch (err) {
      console.error(err);
      error("Delete failed!", "Something went wrong");
    }
  }, [selectedTemplate, start, stop, error]);

  return (
    <div className="space-y-4">
      <Header onCreateTemplate={() => setShowCreate(true)} />

      <CreateTemplateDialog
        open={showCreate}
        onOpenChange={(o) => !o && setShowCreate(o)}
        onSubmit={handleCreateTemplate}
      />

      <TemplateGrid
        data={data}
        error={errorMessage}
        refetch={fetchAllTemplates}
        onUseTemplate={handleUseTemplate}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />

      <DeleteDialog
        open={showDelete}
        onOpenChange={(o) => !o && setShowDelete(o)}
        name={selectedTemplate?.name}
        onDelete={deleteConfirm}
      />
    </div>
  );
};

export { TemplateManager };

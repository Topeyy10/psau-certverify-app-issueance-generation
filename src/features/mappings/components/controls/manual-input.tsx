"use client";

import { PlusIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useData } from "../../lib/contexts/data-provider";
import { useAppActions } from "../../lib/hooks";
import type { DataRow } from "../../lib/types";

const FormField = memo(
  ({
    placeholder,
    value,
    onChange,
  }: {
    placeholder: { key: string; label: string; mappable: boolean };
    value: string;
    onChange: (key: string, value: string) => void;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={placeholder.key} className="text-sm font-medium">
        {placeholder.label}
      </Label>
      <Input
        id={placeholder.key}
        type={placeholder.key === "email" ? "email" : "text"}
        value={value}
        onChange={(e) => onChange(placeholder.key, e.target.value)}
        placeholder={`Enter ${placeholder.label.toLowerCase()}`}
        className="w-full"
      />
    </div>
  ),
);

const ManualInput = memo(() => {
  const { placeholders } = useData();
  const { addRow } = useAppActions();

  // Memoize initial form state
  const initialFormData = useMemo(() => {
    const data: Record<string, string> = {};
    placeholders.forEach((placeholder) => {
      if (placeholder.mappable) {
        data[placeholder.key] = "";
      }
    });
    return data;
  }, [placeholders]);

  const [formData, setFormData] =
    useState<Record<string, string>>(initialFormData);

  const handleInputChange = useCallback((key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const hasData = Object.values(formData).some(
        (value) => value.trim() !== "",
      );
      if (!hasData) return;

      const newRow: DataRow = {
        id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        ...formData,
      };

      addRow(newRow);
      setFormData(initialFormData);
    },
    [formData, addRow, initialFormData],
  );

  const isFormEmpty = useMemo(
    () => Object.values(formData).every((value) => value.trim() === ""),
    [formData],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {placeholders.map((placeholder) => {
          if (!placeholder.mappable) return null;

          return (
            <FormField
              key={placeholder.key}
              placeholder={placeholder}
              value={formData[placeholder.key] || ""}
              onChange={handleInputChange}
            />
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isFormEmpty} className="min-w-[120px]">
          <PlusIcon className="size-4 mr-2" />
          Add Entry
        </Button>
      </div>
    </form>
  );
});

export { ManualInput };

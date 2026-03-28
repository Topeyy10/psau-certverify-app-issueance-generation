import { useCallback } from "react";
import type { FieldValues } from "react-hook-form";

interface UpdateSettingsProps<T extends FieldValues> {
  defaultValues: T;
  update: (data: T) => Promise<void>;
  onSuccess?: () => void;
}

export const useUpdateSettings = <T extends FieldValues>({
  defaultValues,
  update,
  onSuccess,
}: UpdateSettingsProps<T>) => {
  return useCallback(
    async (data: T) => {
      const changedValues = {} as Partial<T>;

      Object.keys(data).forEach((key) => {
        const fieldKey = key as keyof T;
        if (data[fieldKey] !== defaultValues[fieldKey]) {
          changedValues[fieldKey] = data[fieldKey];
        }
      });

      if (Object.keys(changedValues).length > 0) {
        await update(changedValues as T);
        onSuccess?.();
      }
    },
    [defaultValues, onSuccess, update],
  );
};

import { useForm } from "@tanstack/react-form";
import { useEffect, useRef } from "react";

import { useDebouncedSave } from "@/hooks/use-debounced-save";

type UseServerFormOpts<TFormData, TQueryData> = {
  defaultValues: TFormData;
  queryData: TQueryData | undefined;
  mapDataToForm: (data: TQueryData) => TFormData;
  onSubmit: (values: TFormData) => Promise<void>;
  debounceMs?: number;
};

export function useServerForm<TFormData, TQueryData>({
  defaultValues,
  queryData,
  mapDataToForm,
  onSubmit,
  debounceMs = 700,
}: UseServerFormOpts<TFormData, TQueryData>) {
  const initialized = useRef(false);
  const prevQueryData = useRef(queryData);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  useEffect(() => {
    if (queryData === undefined && prevQueryData.current !== undefined) {
      initialized.current = false;
    }
    prevQueryData.current = queryData;

    if (!queryData) return;
    if (initialized.current) return;

    initialized.current = true;
    const mapped = mapDataToForm(queryData);
    for (const [key, value] of Object.entries(mapped as Record<string, unknown>)) {
      form.setFieldValue(key as never, value as never);
    }
  }, [queryData]);

  const save = useDebouncedSave(async () => {
    await form.handleSubmit();
  }, debounceMs);

  const initialAutoSaveDone = useRef(false);

  useEffect(() => {
    if (!initialized.current) return;
    if (!initialAutoSaveDone.current) {
      initialAutoSaveDone.current = true;
      return;
    }
    save();
  }, [form.state.values]);

  return { form, save };
}

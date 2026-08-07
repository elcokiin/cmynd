import { useRef, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Field, FieldLabel, FieldError } from "@elcokiin/ui/field";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { MonthPicker } from "@elcokiin/ui/month-picker";
import { Switch } from "@elcokiin/ui/switch";
import { TextareaWithIcon } from "@/components/ui/input-with-icon";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@elcokiin/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@elcokiin/ui/select";
import { Separator } from "@elcokiin/ui/separator";
import { useErrorHandler } from "@/hooks/use-error-handler";
import {
  FileTextIcon,
  PuzzleIcon,
  BadgeCheckIcon,
  ClockIcon,
} from "lucide-react";
import { toast } from "sonner";
import { normalizeOptionalText } from "@/lib/text";
import { experienceSchema, defaultFormValues } from "./experience-schema";
import { SkillPicker } from "@/components/portfolio/skill-picker";
import type { AdminExperience, ExperienceType } from "@elcokiin/backend/lib/types/portfolio";

interface ExperienceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry?: AdminExperience;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Separator className="flex-1" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

export function ExperienceFormSheet({ open, onOpenChange, editingEntry }: ExperienceFormSheetProps) {
  const { handleError } = useErrorHandler();
  const createExperience = useMutation(api.portfolio.mutations.createExperience);
  const updateExperience = useMutation(api.portfolio.mutations.updateExperience);
  const allSkills = useQuery(api.portfolio.queries.listAllSkills);
  const previousEndDateRef = useRef("");
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open && !wasOpen.current) {
      form.reset(defaultFormValues(editingEntry));
    }
    wasOpen.current = open;
  }, [open, editingEntry]);

  const form = useForm({
    defaultValues: defaultFormValues(editingEntry),
    validators: { onSubmit: experienceSchema as any },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          type: value.type,
          title: value.title,
          organization: value.organization,
          description: normalizeOptionalText(value.description ?? ""),
          startDate: normalizeOptionalText(value.startDate ?? ""),
          endDate: normalizeOptionalText(value.endDate ?? ""),
          isCurrent: value.isCurrent,
          durationHours: value.durationHours || undefined,
          credentialId: normalizeOptionalText(value.credentialId ?? ""),
          credentialUrl: normalizeOptionalText(value.credentialUrl ?? ""),
          skillIds: value.skillIds.length > 0 ? value.skillIds : undefined,
          order: value.order,
        };

        if (editingEntry) {
          await updateExperience({ _id: editingEntry._id, ...payload });
          toast.success("Experience updated");
        } else {
          await createExperience(payload);
          toast.success("Experience created");
        }

        onOpenChange(false);
      } catch (error) {
        handleError(error, { context: "ExperienceFormSheet.handleSubmit" });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col h-full"
    >
      <SheetHeader className="border-b pb-4 px-6">
        <SheetTitle>
          {editingEntry ? "Edit Experience" : "New Experience"}
        </SheetTitle>
        <SheetDescription>
          {editingEntry
            ? `Update "${editingEntry.title}" — changes are saved immediately.`
            : "Add a new experience entry to your portfolio."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <div className="space-y-5">
          <SectionHeader label="Basic Information" />

          <form.Field name="type">
            {(field) => (
              <div className="grid gap-3">
                <Label>Type</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => {
                    field.handleChange(v as ExperienceType);
                    if (v !== "certification") {
                      field.form.setFieldValue("credentialId", "");
                      field.form.setFieldValue("credentialUrl", "");
                      field.form.setFieldValue("durationHours", 0);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <form.Field name="title">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Title <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Job title / Degree"
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="organization">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Organization <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Company / School"
                    required
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </div>
        </div>

        <div className="space-y-5">
          <SectionHeader label="Description" />

          <form.Field name="description">
            {(field) => (
              <div className="grid gap-3">
                <Label>Description</Label>
                <TextareaWithIcon
                  icon={<FileTextIcon />}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe your role, responsibilities, or achievements"
                  rows={3}
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="space-y-5">
          <SectionHeader label="Period" />

          <div className="flex flex-wrap items-end gap-3">
            <form.Field name="startDate">
              {(field) => (
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <MonthPicker
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="endDate">
              {(field) => (
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <MonthPicker
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={field.form.getFieldValue("isCurrent")}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="isCurrent">
              {(field) => (
                <div className="flex items-center gap-2 pb-0.5">
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={(checked) => {
                      field.handleChange(checked);
                      if (checked) {
                        previousEndDateRef.current = field.form.getFieldValue("endDate") as string;
                        field.form.setFieldValue("endDate", "");
                      } else if (previousEndDateRef.current) {
                        field.form.setFieldValue("endDate", previousEndDateRef.current);
                      }
                    }}
                  />
                  <Label className="whitespace-nowrap">Current</Label>
                </div>
              )}
            </form.Field>
          </div>
        </div>

        <form.Field name="skillIds">
          {(field) => (
            <div className="space-y-5">
              <div className="space-y-5">
                <SectionHeader label="Skills" />
                <div className="grid gap-3">
                  <div className="flex items-center gap-1.5">
                    <PuzzleIcon className="h-4 w-4 text-muted-foreground" />
                    <Label>Skills Used</Label>
                  </div>
                  <SkillPicker
                    skills={allSkills}
                    value={field.state.value.map((skillId) => ({ skillId }))}
                    onChange={(links) =>
                      field.handleChange(links.map((link) => link.skillId))
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </form.Field>

        <form.Subscribe>
          {(state) => {
            const currentType = state.values.type as ExperienceType;
            if (currentType !== "certification") return null;
            return (
              <div className="space-y-5">
                <SectionHeader label="Certification Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <form.Field name="credentialId">
                    {(field) => (
                      <div className="grid gap-3">
                        <div className="flex items-center gap-1.5">
                          <BadgeCheckIcon className="h-4 w-4 text-muted-foreground" />
                          <Label>Credential ID</Label>
                        </div>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g. ABC-123"
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="credentialUrl">
                    {(field) => (
                      <div className="grid gap-3">
                        <Label>Credential URL</Label>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="https://..."
                          type="url"
                        />
                      </div>
                    )}
                  </form.Field>
                </div>

                <form.Field name="durationHours">
                  {(field) => (
                    <div className="grid gap-3">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        <Label>Duration (hours)</Label>
                      </div>
                      <Input
                        type="number"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        min={0}
                        placeholder="e.g. 40"
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            );
          }}
        </form.Subscribe>

        <div className="space-y-5">
          <SectionHeader label="Settings" />

          <form.Field name="order">
            {(field) => (
              <div className="grid gap-3">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
              </div>
            )}
          </form.Field>
        </div>
      </div>

      <SheetFooter className="border-t pt-4">
        <form.Subscribe>
          {(state) => (
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                type="button"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={state.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={state.isSubmitting}>
                {state.isSubmitting
                  ? "Saving..."
                  : editingEntry
                    ? "Update Entry"
                    : "Create Entry"}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </SheetFooter>
    </form>
  );
}

import { useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { MonthPicker } from "@elcokiin/ui/month-picker";
import { Switch } from "@elcokiin/ui/switch";
import { Badge } from "@elcokiin/ui/badge";
import { TextareaWithIcon } from "@/components/ui/input-with-icon";
import { TagsInput } from "@/components/ui/tags-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@elcokiin/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@elcokiin/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@elcokiin/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@elcokiin/ui/dialog";
import { Separator } from "@elcokiin/ui/separator";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { PlusIcon, PencilIcon, Trash2Icon, BriefcaseIcon, FileTextIcon, PuzzleIcon, BadgeCheckIcon, ClockIcon } from "lucide-react";
import { toast } from "sonner";
import { normalizeOptionalText } from "@/lib/text";

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { AdminExperience, ExperienceType } from "@elcokiin/backend/lib/types/portfolio";

interface ExperienceListProps {
  experience: AdminExperience[] | undefined;
}

const experienceSchema = z.object({
  type: z.enum(["work", "education", "certification"]),
  title: z.string().min(1, "Title is required"),
  organization: z.string().min(1, "Organization is required"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional().default(false),
  durationHours: z.number().min(0).optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  technologies: z.array(z.string()).optional().default([]),
  order: z.number().min(0),
});

function defaultFormValues(entry?: AdminExperience): z.infer<typeof experienceSchema> {
  return {
    type: entry?.type ?? "work",
    title: entry?.title ?? "",
    organization: entry?.organization ?? "",
    description: entry?.description ?? "",
    startDate: entry?.startDate ?? "",
    endDate: entry?.endDate ?? "",
    isCurrent: entry?.isCurrent ?? false,
    durationHours: entry?.durationHours ?? 0,
    credentialId: entry?.credentialId ?? "",
    credentialUrl: entry?.credentialUrl ?? "",
    technologies: entry?.technologies ?? [],
    order: entry?.order ?? 0,
  };
}

const typeLabels: Record<ExperienceType, string> = {
  work: "Work",
  education: "Education",
  certification: "Certification",
};

const typeColors: Record<ExperienceType, string> = {
  work: "bg-blue-100 text-blue-800",
  education: "bg-purple-100 text-purple-800",
  certification: "bg-green-100 text-green-800",
};

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Separator className="flex-1" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

export function ExperienceList({ experience }: ExperienceListProps) {
  const { handleError } = useErrorHandler();
  const createExperience = useMutation(api.portfolio.mutations.createExperience);
  const updateExperience = useMutation(api.portfolio.mutations.updateExperience);
  const removeExperience = useMutation(api.portfolio.mutations.removeExperience);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AdminExperience | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Id<"experience"> | null>(null);

  const isLoading = experience === undefined;
  const previousEndDateRef = useRef("");

  const form = useForm({
    defaultValues: defaultFormValues(),
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
          technologies: value.technologies.length > 0 ? value.technologies : undefined,
          order: value.order,
        };

        if (editingEntry) {
          await updateExperience({ _id: editingEntry._id, ...payload });
          toast.success("Experience updated");
        } else {
          await createExperience(payload);
          toast.success("Experience created");
        }

        setDialogOpen(false);
        setEditingEntry(undefined);
        form.reset();
      } catch (error) {
        handleError(error, { context: "ExperienceList.handleSubmit" });
      }
    },
  });

  const openCreate = () => {
    setEditingEntry(undefined);
    form.reset();
    setDialogOpen(true);
  };

  const openEdit = (entry: AdminExperience) => {
    setEditingEntry(entry);
    form.reset();
    form.setFieldValue("type", entry.type);
    form.setFieldValue("title", entry.title);
    form.setFieldValue("organization", entry.organization);
    form.setFieldValue("description", entry.description ?? "");
    form.setFieldValue("startDate", entry.startDate ?? "");
    form.setFieldValue("endDate", entry.endDate ?? "");
    form.setFieldValue("isCurrent", entry.isCurrent ?? false);
    form.setFieldValue("durationHours", entry.durationHours ?? 0);
    form.setFieldValue("credentialId", entry.credentialId ?? "");
    form.setFieldValue("credentialUrl", entry.credentialUrl ?? "");
    form.setFieldValue("technologies", entry.technologies ?? []);
    form.setFieldValue("order", entry.order);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeExperience({ _id: deleteTarget });
      toast.success("Experience deleted");
      setDeleteTarget(null);
    } catch (error) {
      handleError(error, { context: "ExperienceList.handleDelete" });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Loading experience...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Experience</CardTitle>
            <Button size="sm" onClick={openCreate}>
              <PlusIcon className="h-4 w-4 mr-1" />
              New Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {!experience || experience.length === 0 ? (
            <div className="py-10 text-center">
              <BriefcaseIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No experience entries yet</p>
            </div>
          ) : (
            experience.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className={typeColors[entry.type]}>
                      {typeLabels[entry.type]}
                    </Badge>
                    <h4 className="font-medium">{entry.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      at {entry.organization}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.startDate && (
                      <span className="text-xs text-muted-foreground">
                        {entry.startDate}
                        {entry.isCurrent
                          ? " - Present"
                          : entry.endDate
                            ? ` - ${entry.endDate}`
                            : ""}
                      </span>
                    )}
                    {entry.isCurrent && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        Current
                      </Badge>
                    )}
                  </div>
                  {entry.technologies && entry.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(entry)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setDeleteTarget(entry._id)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Sheet open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingEntry(undefined); } }}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
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
                      <div className="grid gap-2">
                        <Label>Title</Label>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Job title / Degree"
                          required
                        />
                        {field.state.meta.errors.map((err) => (
                          <p key={err?.message} className="text-xs text-destructive">{err?.message}</p>
                        ))}
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="organization">
                    {(field) => (
                      <div className="grid gap-2">
                        <Label>Organization</Label>
                        <Input
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Company / School"
                          required
                        />
                        {field.state.meta.errors.map((err) => (
                          <p key={err?.message} className="text-xs text-destructive">{err?.message}</p>
                        ))}
                      </div>
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
                              previousEndDateRef.current = field.form.getFieldValue("endDate");
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

              <form.Field name="technologies">
                {(field) => (
                  <div className="space-y-5">
                    <div className="space-y-5">
                      <SectionHeader label="Technologies" />
                      <div className="grid gap-3">
                        <div className="flex items-center gap-1.5">
                          <PuzzleIcon className="h-4 w-4 text-muted-foreground" />
                          <Label>Technologies Used</Label>
                        </div>
                        <TagsInput
                          value={field.state.value}
                          onChange={field.handleChange}
                          placeholder="e.g. React, Python, AWS"
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
                      onClick={() => {
                        setDialogOpen(false);
                        setEditingEntry(undefined);
                      }}
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
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Experience</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this experience entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

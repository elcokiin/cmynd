import { useState } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@elcokiin/ui/dialog";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { PlusIcon, PencilIcon, Trash2Icon, BriefcaseIcon, FileTextIcon } from "lucide-react";
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

export function ExperienceList({ experience }: ExperienceListProps) {
  const { handleError } = useErrorHandler();
  const createExperience = useMutation(api.portfolio.mutations.createExperience);
  const updateExperience = useMutation(api.portfolio.mutations.updateExperience);
  const removeExperience = useMutation(api.portfolio.mutations.removeExperience);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AdminExperience | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Id<"experience"> | null>(null);

  const isLoading = experience === undefined;

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
        <CardContent className="space-y-3">
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

      <Dialog open={dialogOpen} onOpenChange={(open) => { !open && setDialogOpen(false); }}>
        <DialogContent className="sm:max-w-[600px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Edit Experience" : "New Experience"}
              </DialogTitle>
              <DialogDescription>
                Fill in the experience details below.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-4 max-h-[60vh] overflow-y-auto">
              <form.Field name="type">
                {(field) => (
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v as ExperienceType)}
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

              <div className="grid grid-cols-2 gap-4">
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

              <form.Field name="description">
                {(field) => (
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <TextareaWithIcon
                      icon={<FileTextIcon />}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Describe your role or achievement"
                      rows={3}
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-3 gap-4">
                <form.Field name="startDate">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label>Start Date</Label>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="2020-01"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="endDate">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label>End Date</Label>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="2023-12"
                        disabled={field.form.getFieldValue("isCurrent")}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="isCurrent">
                  {(field) => (
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={field.state.value}
                        onCheckedChange={(checked) => {
                          field.handleChange(checked);
                          if (checked) {
                            field.form.setFieldValue("endDate", "");
                          }
                        }}
                      />
                      <Label>Current</Label>
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="durationHours">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label>Duration (hours)</Label>
                      <Input
                        type="number"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="order">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label>Order</Label>
                      <Input
                        type="number"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="technologies">
                {(field) => (
                  <div className="grid gap-2">
                    <Label>Technologies</Label>
                    <TagsInput
                      value={field.state.value}
                      onChange={field.handleChange}
                      placeholder="Type and press Enter to add..."
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-4">
                <form.Field name="credentialId">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label>Credential ID</Label>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Credential ID"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="credentialUrl">
                  {(field) => (
                    <div className="grid gap-2">
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
            </div>

            <DialogFooter>
              <form.Subscribe>
                {(state) => (
                  <>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setDialogOpen(false);
                        setEditingEntry(undefined);
                      }}
                      disabled={state.isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={state.isSubmitting}>
                      {state.isSubmitting
                        ? "Saving..."
                        : editingEntry
                          ? "Update Entry"
                          : "Create Entry"}
                    </Button>
                  </>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

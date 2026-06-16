import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { Label } from "@elcokiin/ui/label";
import { Switch } from "@elcokiin/ui/switch";
import { Tooltip, TooltipTrigger } from "@elcokiin/ui/tooltip";
import {
	BadgeIcon,
	BookOpenIcon,
	CalendarIcon,
	FileTextIcon,
	GlobeIcon,
	LanguagesIcon,
	UserIcon,
} from "lucide-react";

import { useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";

import { AuthorSearchCommand } from "@/components/authors/author-search-command";
import {
	InputWithIcon,
	TextareaWithIcon,
} from "@/components/ui/input-with-icon";
import { useErrorHandler } from "@/hooks/use-error-handler";

type ReprintFormValues = {
	type: "own" | "reprint";
	originalAuthor: string;
	originalAuthorId: Id<"authors"> | undefined;
	originalTitle: string;
	originalDate: string;
	sourceUrl: string;
	license: string;
	translator: string;
	notes: string;
};

type ReprintSectionProps = {
	documentId: Id<"documents">;
};

export function ReprintSection({ documentId }: ReprintSectionProps) {
	const { handleError } = useErrorHandler();
	const document = useQuery(api.documents.queries.getForEdit, { documentId });
	const updateReprint = useMutation(api.documents.mutations.updateReprint);
	const updateType = useMutation(api.documents.mutations.updateType);
	const initializedRef = useRef(false);

	const form = useForm({
		defaultValues: {
			type: "own",
			originalAuthor: "",
			originalAuthorId: undefined as Id<"authors"> | undefined,
			originalTitle: "",
			originalDate: "",
			sourceUrl: "",
			license: "",
			translator: "",
			notes: "",
		} as ReprintFormValues,
		listeners: {
			onChangeDebounceMs: 700,
			onChange: async ({ formApi }) => {
				if (!initializedRef.current) return;
				const values = formApi.state.values;
				try {
					if (values.type !== document?.type) {
						await updateType({ documentId, type: values.type });
					}
					await updateReprint({
						documentId,
						reprint: {
							originalAuthor: values.originalAuthor,
							originalAuthorId: values.originalAuthorId,
							originalTitle: values.originalTitle || undefined,
							originalDate: values.originalDate
								? parseInt(values.originalDate, 10) || undefined
								: undefined,
							sourceUrl: values.sourceUrl || undefined,
							license: values.license || undefined,
							translator: values.translator || undefined,
							notes: values.notes || undefined,
						},
					});
				} catch (error) {
					handleError(error, { context: "ReprintSection.autoSave" });
				}
			},
		},
	});

	useEffect(() => {
		if (!document) return;
		if (initializedRef.current) return;
		initializedRef.current = true;

		form.setFieldValue(
			"type",
			document.type === "reprint" ? "reprint" : "own",
		);
		form.setFieldValue(
			"originalAuthor",
			document.reprint?.originalAuthor ?? "",
		);
		form.setFieldValue(
			"originalAuthorId",
			document.reprint?.originalAuthorId,
		);
		form.setFieldValue(
			"originalTitle",
			document.reprint?.originalTitle ?? "",
		);
		form.setFieldValue(
			"originalDate",
			document.reprint?.originalDate?.toString() ?? "",
		);
		form.setFieldValue("sourceUrl", document.reprint?.sourceUrl ?? "");
		form.setFieldValue("license", document.reprint?.license ?? "");
		form.setFieldValue("translator", document.reprint?.translator ?? "");
		form.setFieldValue("notes", document.reprint?.notes ?? "");
	}, [document, form]);

	return (
		<form.Subscribe>
			{(state) => {
				const isReprint = state.values.type === "reprint";

				return (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-medium mb-1">
									Reprint
								</h3>
								<p className="text-sm text-muted-foreground">
									Mark this document as a reprint if the
									content was originally written by another
									author.
								</p>
							</div>
							<Tooltip>
								<TooltipTrigger>
									<form.Field name="type">
										{(field) => (
											<Switch
												id="reprint-toggle"
												checked={isReprint}
												onCheckedChange={(checked) =>
													field.handleChange(
														checked
															? "reprint"
															: "own",
													)
												}
											/>
										)}
									</form.Field>
								</TooltipTrigger>
							</Tooltip>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2 sm:col-span-2">
								<Label
									htmlFor="originalAuthor"
									className="text-sm font-medium"
								>
									Original Author{" "}
									<span className="text-destructive">*</span>
								</Label>
								{isReprint ? (
									<form.Field name="originalAuthor">
										{(field) => (
											<AuthorSearchCommand
												initialAuthorId={
													state.values
														.originalAuthorId
												}
												onSelect={(
													name,
													id: Id<"authors">,
												) => {
													field.handleChange(name);
													form.setFieldValue(
														"originalAuthorId",
														id,
													);
												}}
											/>
										)}
									</form.Field>
								) : (
									<form.Field name="originalAuthor">
										{(field) => (
											<InputWithIcon
												icon={
													<UserIcon className="h-4 w-4" />
												}
												disabled
												id={field.name}
												value={field.state.value}
												onChange={(e) =>
													field.handleChange(
														e.target.value,
													)
												}
												placeholder="e.g. Gabriel García Márquez"
											/>
										)}
									</form.Field>
								)}
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="originalTitle"
									className="text-sm font-medium"
								>
									Original Title
								</Label>
								<form.Field name="originalTitle">
									{(field) => (
										<InputWithIcon
											icon={
												<BookOpenIcon className="h-4 w-4" />
											}
											disabled={!isReprint}
											id={field.name}
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value,
												)
											}
											placeholder="e.g. Cien años de soledad"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="originalDate"
									className="text-sm font-medium"
								>
									Original Year
								</Label>
								<form.Field name="originalDate">
									{(field) => (
										<InputWithIcon
											icon={
												<CalendarIcon className="h-4 w-4" />
											}
											disabled={!isReprint}
											id={field.name}
											type="number"
											min={0}
											max={2100}
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value,
												)
											}
											placeholder="e.g. 1967"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2 sm:col-span-2">
								<Label
									htmlFor="sourceUrl"
									className="text-sm font-medium"
								>
									Source URL
								</Label>
								<form.Field name="sourceUrl">
									{(field) => (
										<InputWithIcon
											icon={
												<GlobeIcon className="h-4 w-4" />
											}
											disabled={!isReprint}
											id={field.name}
											type="url"
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value,
												)
											}
											placeholder="e.g. https://example.com/original-work"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="license"
									className="text-sm font-medium"
								>
									License
								</Label>
								<form.Field name="license">
									{(field) => (
										<InputWithIcon
											icon={
												<BadgeIcon className="h-4 w-4" />
											}
											disabled={!isReprint}
											id={field.name}
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value,
												)
											}
											placeholder="e.g. Public Domain"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="translator"
									className="text-sm font-medium"
								>
									Translator
								</Label>
								<form.Field name="translator">
									{(field) => (
										<InputWithIcon
											icon={
												<LanguagesIcon className="h-4 w-4" />
											}
											disabled={!isReprint}
											id={field.name}
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value,
												)
											}
											placeholder="e.g. Gregory Rabassa"
										/>
									)}
								</form.Field>
							</div>

							<div className="space-y-2 sm:col-span-2">
								<Label
									htmlFor="reprintNotes"
									className="text-sm font-medium"
								>
									Notes
								</Label>
								<form.Field name="notes">
									{(field) => (
										<TextareaWithIcon
											icon={
												<FileTextIcon className="h-4 w-4" />
											}
											disabled={!isReprint}
											id={field.name}
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value,
												)
											}
											placeholder="Additional context, acknowledgments, or notes about this reprint..."
										/>
									)}
								</form.Field>
							</div>
						</div>
					</div>
				);
			}}
		</form.Subscribe>
	);
}

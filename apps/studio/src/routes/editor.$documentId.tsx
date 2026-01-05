import type { JSONContent } from "novel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { Button, buttonVariants } from "@elcokiin/ui/button";
import { cn } from "@elcokiin/ui/lib/utils";
import { Skeleton } from "@elcokiin/ui/skeleton";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { setImageUploadFn } from "@/components/editor/image-upload";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/editor/$documentId")({
  component: EditorRoute,
});

function EditorRoute() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <Authenticated>
        <EditorContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center h-full">
          {showSignIn ? (
            <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
          )}
        </div>
      </Unauthenticated>
      <AuthLoading>
        <EditorSkeleton />
      </AuthLoading>
    </>
  );
}

function EditorContent() {
  const { documentId } = Route.useParams();
  const navigate = useNavigate();

  const document = useQuery(api.documents.getForEdit, {
    documentId: documentId as Id<"documents">,
  });
  const updateContent = useMutation(api.documents.updateContent);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const getStorageUrl = useMutation(api.storage.getUrl);

  // Configure image upload with Convex storage
  useEffect(() => {
    setImageUploadFn(async (file: File) => {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await response.json();

      // Get the public URL for the uploaded file
      const url = await getStorageUrl({ storageId });
      if (!url) {
        throw new Error("Failed to get image URL");
      }

      return url;
    });
  }, [generateUploadUrl, getStorageUrl]);

  // Handle debounced content updates (auto-save)
  const handleDebouncedUpdate = useCallback(
    async (content: JSONContent) => {
      try {
        await updateContent({
          documentId: documentId as Id<"documents">,
          content,
        });
      } catch (error) {
        console.error("Failed to save document:", error);
        toast.error("Failed to save document");
      }
    },
    [documentId, updateContent]
  );

  // Loading state
  if (document === undefined) {
    return <EditorSkeleton />;
  }

  // Document not found or unauthorized
  if (document === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h1 className="text-2xl font-bold">Document not found</h1>
        <p className="text-muted-foreground">
          The document you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate({ to: "/" })}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isEditable = document.status === "building";

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold truncate max-w-md">
              {document.title || "Untitled"}
            </h1>
            <span className="text-xs text-muted-foreground capitalize">
              {document.status} · {document.type}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditable && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Read-only (Published)
            </span>
          )}
          {/* TODO: Add settings route */}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <AdvancedEditor
            initialContent={document.content as JSONContent | undefined}
            onDebouncedUpdate={isEditable ? handleDebouncedUpdate : undefined}
            editable={isEditable}
            className="min-h-full"
          />
        </div>
      </div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Editor skeleton */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}

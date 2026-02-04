import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { toast } from "sonner";
import { CheckIcon, XIcon, LoaderIcon, RefreshCcwIcon, FileImage } from "lucide-react";

import { Button } from "@elcokiin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { Label } from "@elcokiin/ui/label";
import { cn } from "@elcokiin/ui/lib/utils";

import { useErrorHandler } from "@/hooks/use-error-handler";

type ReviewSidebarProps = {
  slug: string | null | undefined;
  onActionComplete?: () => void;
};

export function ReviewSidebar({
  slug,
  onActionComplete,
}: ReviewSidebarProps): React.ReactNode {
  const navigate = useNavigate();
  const [observations, setObservations] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isMovingToPending, setIsMovingToPending] = useState(false);
  const { handleError } = useErrorHandler();

  // Fetch document to get ID for mutations
  const document = useQuery(
    api.documents.queries.getForAdminReviewBySlug,
    slug ? { slug } : "skip",
  );

  const coverImageUrl = useQuery(
    api.storage.getUrl,
    document?.coverImageId ? { storageId: document.coverImageId } : "skip"
  );

  const approveMutation = useMutation(api.documents.mutations.approve);
  const rejectMutation = useMutation(api.documents.mutations.reject);
  const moveBackToPendingMutation = useMutation(api.documents.mutations.moveBackToPending);

  const isProcessing = isApproving || isRejecting || isMovingToPending;
  const canReject = observations.trim().length > 0;

  function actionCompleted() {
    navigate({
      to: "/admin/review/$slug",
      params: { slug: slug! },
      replace: true,
    });
    // Or redirect to list if we want to move to next
    // But for now stay or callback
    if (onActionComplete) onActionComplete();
  }

  async function handleApprove(): Promise<void> {
    if (!document) return;

    setIsApproving(true);
    try {
      await approveMutation({ documentId: document._id });
      toast.success("Document approved and published");
      setObservations("");
      actionCompleted();
    } catch (error) {
      handleError(error, { context: "ReviewSidebar.handleApprove" });
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject(): Promise<void> {
    if (!document || !canReject) return;

    setIsRejecting(true);
    try {
      await rejectMutation({ documentId: document._id, reason: observations.trim() });
      toast.success("Document rejected with feedback");
      actionCompleted();
    } catch (error) {
      handleError(error, { context: "ReviewSidebar.handleReject" });
    } finally {
      setIsRejecting(false);
    }
  }

  async function handleMoveToPending(): Promise<void> {
    if (!document) return;

    setIsMovingToPending(true);
    try {
      await moveBackToPendingMutation({ documentId: document._id });
      toast.success("Document moved back to pending");
      actionCompleted();
    } catch (error) {
      handleError(error, { context: "ReviewSidebar.handleMoveToPending" });
    } finally {
      setIsMovingToPending(false);
    }
  }

  if (!slug) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Review Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a document to review
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!document) {
      return (
          <Card>
              <CardContent className="p-6">
                  <LoaderIcon className="h-4 w-4 animate-spin mx-auto" />
              </CardContent>
          </Card>
      )
  }

  return (
    <div className="space-y-4">
      {/* Document Context */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cover Image */}
          {coverImageUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border">
              <img
                src={coverImageUrl}
                alt="Document Cover"
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
             <div className="flex items-center justify-center aspect-video w-full rounded-md border bg-muted/50 text-muted-foreground">
                <div className="flex flex-col items-center gap-1">
                    <FileImage className="h-8 w-8 opacity-50" />
                    <span className="text-xs">No cover image</span>
                </div>
             </div>
          )}
          
          {/* Curation/Description */}
          {document.curation && (
              <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Curation Spin / Prompt</Label>
                  <p className="text-sm text-foreground bg-muted p-2 rounded-md">
                      {document.curation.spin}
                  </p>
              </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Review Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {document.status === "published" ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-500/10 text-green-600 rounded-md text-sm border border-green-200">
                This document is published.
              </div>
              <Button
                onClick={handleMoveToPending}
                disabled={isProcessing}
                className="w-full"
                variant="outline"
              >
                {isMovingToPending ? (
                  <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcwIcon className="h-4 w-4 mr-2" />
                )}
                Move back to Pending
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="observations" className="text-sm">
                  Observations / Feedback
                </Label>
                <textarea
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Add observations or feedback for the author..."
                  disabled={isProcessing}
                  className={cn(
                    "w-full min-h-[120px] p-3 text-sm rounded-md border resize-y",
                    "bg-background placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  {canReject
                    ? "Observations will be sent to the author if rejected"
                    : "Required for rejection"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1"
                  variant="default"
                >
                  {isApproving ? (
                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isProcessing || !canReject}
                  className="flex-1"
                  variant="destructive"
                >
                  {isRejecting ? (
                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XIcon className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

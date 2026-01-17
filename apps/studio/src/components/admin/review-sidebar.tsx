import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { toast } from "sonner";
import { CheckIcon, XIcon, LoaderIcon } from "lucide-react";

import { Button } from "@elcokiin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@elcokiin/ui/card";
import { Label } from "@elcokiin/ui/label";
import { cn } from "@elcokiin/ui/lib/utils";

import { useErrorHandler } from "@/hooks/use-error-handler";

type ReviewSidebarProps = {
  documentId: Id<"documents"> | null;
  onActionComplete?: () => void;
};

export function ReviewSidebar({
  documentId,
  onActionComplete,
}: ReviewSidebarProps): React.ReactNode {
  const navigate = useNavigate();
  const [observations, setObservations] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { handleError } = useErrorHandler();

  const approveMutation = useMutation(api.documents.mutations.approve);
  const rejectMutation = useMutation(api.documents.mutations.reject);

  const isProcessing = isApproving || isRejecting;
  const canReject = observations.trim().length > 0;

  function actionCompleted() {
    navigate({
      to: "/admin/review",
      search: {},
      replace: true,
    });
    if (onActionComplete) onActionComplete();
  }

  async function handleApprove(): Promise<void> {
    if (!documentId) return;

    setIsApproving(true);
    try {
      await approveMutation({ documentId });
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
    if (!documentId || !canReject) return;

    setIsRejecting(true);
    try {
      await rejectMutation({ documentId, reason: observations.trim() });
      toast.success("Document rejected with feedback");
      actionCompleted();
    } catch (error) {
      handleError(error, { context: "ReviewSidebar.handleReject" });
    } finally {
      setIsRejecting(false);
    }
  }

  if (!documentId) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Review Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@elcokiin/ui/alert-dialog";

type SlugDeletionConfirmDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  slugToDelete: string | null;
};

export function SlugDeletionConfirmDialog({
  open,
  onConfirm,
  onCancel,
  slugToDelete,
}: SlugDeletionConfirmDialogProps): React.ReactNode {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>URL will be broken</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Changing this title will break an existing URL. You currently have
              3 valid URLs for this document (the maximum allowed).
            </p>
            {slugToDelete && (
              <p className="font-mono text-sm bg-muted p-2 rounded">
                /editor/{slugToDelete}
              </p>
            )}
            <p>
              If you continue, the URL above will no longer work. Anyone with
              that link will see a "not found" page.
            </p>
            <p className="font-medium">Do you want to continue?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Continue and Break URL
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import type { DocumentType } from "@elcokiin/backend/lib/types/documents";
import { BookOpenIcon, FileTextIcon, LightbulbIcon, PenIcon } from "lucide-react";

export type { DocumentType };

export const documentTypeConfig: Record<
  DocumentType,
  { label: string; description: string; icon: typeof FileTextIcon }
> = {
  own: {
    label: "Original",
    description: "Create your own content from scratch",
    icon: PenIcon,
  },
  reprint: {
    label: "Reprint",
    description: "Republish content from another author with attribution",
    icon: BookOpenIcon,
  },
  inspiration: {
    label: "Inspiration",
    description: "Collect links and sources that inspired you",
    icon: LightbulbIcon,
  },
};

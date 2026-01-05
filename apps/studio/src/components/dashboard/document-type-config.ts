import { BookOpenIcon, FileTextIcon, LightbulbIcon, PenIcon } from "lucide-react";

export type DocumentType = "own" | "curated" | "inspiration";

export const documentTypeConfig: Record<
  DocumentType,
  { label: string; description: string; icon: typeof FileTextIcon }
> = {
  own: {
    label: "Original",
    description: "Create your own content from scratch",
    icon: PenIcon,
  },
  curated: {
    label: "Curated",
    description: "Curate content from another source with your spin",
    icon: BookOpenIcon,
  },
  inspiration: {
    label: "Inspiration",
    description: "Collect inspiration with references",
    icon: LightbulbIcon,
  },
};

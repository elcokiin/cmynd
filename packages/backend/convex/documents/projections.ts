import type { Doc } from "../_generated/dataModel";

export function projectDocumentListItem(doc: Doc<"documents">) {
  return {
    _id: doc._id,
    title: doc.title,
    type: doc.type,
    status: doc.status,
    coverImageId: doc.coverImageId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    submittedAt: doc.submittedAt,
    rejectionReason: doc.rejectionReason,
  };
}

export function projectPendingDocumentListItem(doc: Doc<"documents">) {
  return {
    _id: doc._id,
    title: doc.title,
    type: doc.type,
    submittedAt: doc.submittedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export type DocumentListItem = ReturnType<typeof projectDocumentListItem>;

export type PendingDocumentListItem = ReturnType<
  typeof projectPendingDocumentListItem
>;

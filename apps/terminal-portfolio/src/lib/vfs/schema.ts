import { z } from 'zod';

export const BaseNodeSchema = z.object({
  name: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  permissions: z.string().optional(),
});

export const FileSchema = BaseNodeSchema.extend({
  type: z.literal('file'),
  content: z.string(),
  extension: z.string().optional(),
});

export type FileNode = z.infer<typeof FileSchema>;

// Need to handle the recursive nature properly for Zod inferencing
export type DirectoryNode = {
  name: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string;
  type: 'directory';
  children: Record<string, FileSystemNode>;
};

export type FileSystemNode = FileNode | DirectoryNode;

export const FileSystemSchema: z.ZodType<FileSystemNode> = z.lazy(() =>
  z.union([
    FileSchema,
    BaseNodeSchema.extend({
      type: z.literal('directory'),
      children: z.record(z.string(), FileSystemSchema),
    }),
  ])
);

export const DirectorySchema: z.ZodType<DirectoryNode> = z.lazy(() =>
  BaseNodeSchema.extend({
    type: z.literal('directory'),
    children: z.record(z.string(), FileSystemSchema),
  })
);

export const VirtualFileSystemSchema = DirectorySchema;

import { z } from "zod";

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(30, "Channel name must be less than 30 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Channel name can only contain lowercase letters, numbers, and hyphens"
    )
    .trim(),
  type: z.enum(["TEXT", "VOICE", "ANNOUNCEMENT"]).optional(),
  categoryId: z.string().optional().nullable(),
  isPrivate: z.boolean().optional(),
});

export const updateChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(30, "Channel name must be less than 30 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Channel name can only contain lowercase letters, numbers, and hyphens"
    )
    .trim()
    .optional(),
  topic: z.string().max(1024, "Topic must be less than 1024 characters").optional().nullable(),
  isPrivate: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  slowMode: z.number().int().min(0).max(21600).optional(),
  categoryId: z.string().optional().nullable(),
  position: z.number().int().min(0).optional(),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(30, "Category name must be less than 30 characters")
    .trim(),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

import { z } from "zod";

export const createServerSchema = z.object({
  name: z
    .string()
    .min(2, "Server name must be at least 2 characters")
    .max(50, "Server name must be less than 50 characters")
    .trim(),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
});

export const updateServerSchema = z.object({
  name: z
    .string()
    .min(2, "Server name must be at least 2 characters")
    .max(50, "Server name must be less than 50 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  imageUrl: z.string().url().optional().nullable(),
});

export const createInviteSchema = z.object({
  serverId: z.string().min(1),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresInHours: z.number().int().positive().optional().nullable(),
});

export type CreateServerInput = z.infer<typeof createServerSchema>;
export type UpdateServerInput = z.infer<typeof updateServerSchema>;
export type CreateInviteInput = z.infer<typeof createInviteSchema>;

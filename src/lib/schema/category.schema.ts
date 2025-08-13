import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category required"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const editCategorySchema = z.object({
  name: z.string().min(1, "Category required"),
});

export type EditCategoryInput = z.infer<typeof editCategorySchema>;

import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category Required"),
});

export type categoryInput = z.infer<typeof createCategorySchema>;

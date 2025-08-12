import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name required"),
  price: z.number().int().min(1, "Price must be at least Rp. 1"),
  description: z.string().min(1, "Description product required"),
  stock: z.number().int().min(0, "Stock must be at least 0"),
  categoryId: z.number().int().optional().nullable(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

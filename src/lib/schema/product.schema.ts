import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name required"),
  price: z.number().int().min(1, "Price must be at least Rp. 1"),
  description: z.string().min(1, "Description product required"),
  stock: z.number().int().min(0, "Stock must be at least 1"),
  categoryId: z.number().int().optional().nullable(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const editProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  price: z.number().positive("Price must be positive").min(1, "Price must be at least Rp. 1"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  stock: z
    .number()
    .int()
    .nonnegative("Stock must be a positive integer")
    .min(1, "Stock must be at least 1"),
  categoryId: z.number().int().nullable(),
});

export type EditProductInput = z.infer<typeof editProductSchema>;

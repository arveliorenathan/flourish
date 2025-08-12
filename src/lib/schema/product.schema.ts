import { z } from "zod";

export const createProduct = z.object({
  name: z.string().min(1, "Product name required"),
  price: z.number().min(1, "Price must be at least Rp. 1"),
  description: z.string().min(1, "Description product required"),
  stock: z.number().min(1, "Stock must be at least 1"),
});

export type ProductInput = z.infer<typeof createProduct>;

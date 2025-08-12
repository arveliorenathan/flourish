"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { CreateCategoryInput, createCategorySchema } from "@/lib/schema/category.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { CreateProductInput, createProductSchema } from "@/lib/schema/product.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export function Product() {
  const [product, setProduct] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProductOpen, setProductOpen] = useState(false);
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState<Category[]>([]);

  const formCategory = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "" },
  });

  const formProduct = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      stock: 0,
      categoryId: null,
    },
  });

  const fetchCategory = async () => {
    try {
      const res = await fetch("/api/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data: Category[] = await res.json();
      console.log("Data ", data);
      setCategory(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProduct = async (
    page: number = 1,
    limit: number = 9,
    search: string = "",
    categoryId: number | null = null
  ) => {
    const params = new URLSearchParams();

    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search) params.append("search", search);
    if (categoryId !== null && categoryId !== undefined) {
      params.append("categoryId", categoryId.toString());
    }

    const response = await fetch(`/api/products?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();
    console.log("Data Product", data);
  };

  const onSubmitProduct = async (data: CreateProductInput) => {
    try {
      if (!image) {
        toast.error("Product image required!");
        return;
      }

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", String(data.price)); // convert number ke string
      formData.append("stock", String(data.stock)); // convert number ke string
      formData.append("imageUrl", image);

      if (data.categoryId !== null && data.categoryId !== undefined) {
        formData.append("categoryId", String(data.categoryId));
      }

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        toast.error("Failed Create Product Data", { duration: 3000 });
        return;
      }

      toast.success("Product created successfully!");
      setProductOpen(false);
      setImage(null);
      setPreview(null);
      formProduct.reset();
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const onSubmitCategory = async (data: CreateCategoryInput) => {
    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        toast.error("Failed Create Category", { duration: 3000 });
        return;
      }

      toast.success("Create Category Successfully", { duration: 3000 });
      formCategory.reset();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchCategory();
  }, [isCategoryOpen]);

  return (
    <div>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Product Management</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCategoryOpen(true)}>
                Category
              </Button>
              <Button variant="outline" onClick={() => setProductOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Input
            type="search"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Separator />
        </CardContent>
        <CardFooter />
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={isProductOpen} onOpenChange={setProductOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-center">Create Product</DialogTitle>
            <DialogDescription className="text-center">
              Please fill in the product data
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1 py-2">
            <Form {...formProduct}>
              <form onSubmit={formProduct.handleSubmit(onSubmitProduct)} className="space-y-4">
                {preview && (
                  <div className="flex justify-center">
                    <div className="aspect-auto">
                      <Image
                        src={preview}
                        alt="Thumbnail Preview"
                        height={100}
                        width={100}
                        className="rounded-md object-cover w-full max-w-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Name */}
                <FormField
                  control={formProduct.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={formProduct.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter product price"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={formProduct.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stock */}
                <FormField
                  control={formProduct.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter product stock"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CategoryId */}
                <FormField
                  control={formProduct.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Category</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(val) => field.onChange(val === "" ? null : Number(val))}
                        defaultValue="">
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {category
                            .filter((cat) => cat.id !== null && cat.id !== undefined)
                            .map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image */}
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImage(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setImage(null);
                          setPreview(null);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <DialogFooter className="shrink-0 pt-4 border-t">
                  <Button type="submit" className="w-full">
                    Create Product
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* List Category Dialog */}
      <Dialog open={isCategoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Product Category</DialogTitle>
            <DialogDescription className="text-center">
              This is a list of product categories.
            </DialogDescription>
          </DialogHeader>

          {/* Category List Scrollable */}
          <div className="mb-4 max-h-60 overflow-y-auto space-y-2 pr-2">
            {category.length ? (
              category.map((item) => (
                <div key={item.id} className="p-2 border rounded flex justify-between items-center">
                  <span>{item.name}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Tidak ada kategori</p>
            )}
          </div>

          {/* Create Category Form */}
          <Form {...formCategory}>
            <form onSubmit={formCategory.handleSubmit(onSubmitCategory)} className="space-y-4">
              <FormField
                control={formCategory.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Create Category
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Edit2Icon, EllipsisIcon, ListFilterIcon, PlusCircle, Trash2Icon } from "lucide-react";
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
import {
  CreateProductInput,
  createProductSchema,
  EditProductInput,
  editProductSchema,
} from "@/lib/schema/product.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Product() {
  // State for main data
  const [product, setProduct] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category[]>([]);

  // State for UI control
  const [isProductOpen, setProductOpen] = useState(false);
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // State for form dan operasi
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State for file/image handling
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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

  const formEdit = useForm<EditProductInput>({
    resolver: zodResolver(editProductSchema),
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

      toast.success("Product created successfully!", { duration: 3000 });
      setProductOpen(false);
      setImage(null);
      setPreview(null);
      formProduct.reset();
      window.location.reload();
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

  const onEditSubmit = async (data: EditProductInput) => {
    try {
      if (!selectedProduct) return;

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", String(data.price)); // convert number ke string
      formData.append("stock", String(data.stock)); // convert number ke string
      if (image) {
        formData.append("imageUrl", image);
      }

      if (data.categoryId !== null && data.categoryId !== undefined) {
        formData.append("categoryId", String(data.categoryId));
      }

      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      toast.success("Product updated successfully!");
      setEditOpen(false);
      formEdit.reset();
      window.location.reload();
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Failed to update product");
    }
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditOpen(true);
    setPreview(product.imageUrl || null);

    formEdit.reset({
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      categoryId: product.categoryId || null,
    });
  };

  const handleCancelEdit = () => {
    setSelectedProduct(null);
    setImage(null);
    setPreview(null);
    formEdit.reset({
      name: "",
      price: 0,
      description: "",
      stock: 0,
      categoryId: null,
    });
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted successfully", {duration: 3000});
      setDeleteOpen(false);
      setProductToDelete(null);
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  useEffect(() => {
    const fetchProduct = async (
      page: number = 1,
      limit: number = 9,
      search: string = searchTerm,
      categoryId: number | null = filterCategory
    ) => {
      const params = new URLSearchParams();

      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (categoryId !== null) {
        params.append("categoryId", categoryId.toString());
      }

      const response = await fetch(`/api/products?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      }
    };

    fetchProduct();
    fetchCategory();
  }, [isCategoryOpen, searchTerm, filterCategory]);

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
          <div className="flex gap-4 items-center">
            <Input
              type="search"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 w-full"
            />

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 rounded-md border">
                <ListFilterIcon className="h-4 w-4" />
                <span>
                  {filterCategory
                    ? category.find((cat) => cat.id === Number(filterCategory))?.name
                    : "Filter"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => setFilterCategory(null)}
                  className={`text-sm ${
                    filterCategory === null ? "font-semibold bg-gray-100" : ""
                  }`}>
                  All Categories
                </DropdownMenuItem>
                {category.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onSelect={() => setFilterCategory(cat.id)}
                    className={`text-sm ${
                      filterCategory === cat.id ? "font-semibold bg-gray-100" : ""
                    }`}>
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(product || []).map((product) => (
              <Card
                key={product.id}
                className="relative group border-2 rounded-lg overflow-hidden aspect-square h-full w-full transition-all hover:shadow-lg">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                <div className="absolute top-4 left-4">
                  <Badge className="px-4 py-2" variant="default">
                    Stock: {product.stock}
                  </Badge>
                </div>

                {/* Badge Status - Improved styling */}
                <div className="absolute top-4 right-4">
                  <Badge className="px-3 py-2" variant="default">
                    Category: {product.category?.name || "Uncategorized"}
                  </Badge>
                </div>

                {/* Product Data - Improved layout */}
                <div className="absolute bottom-4 left-4 right-4 space-y-1.5 text-white">
                  <CardTitle className="text-xl font-bold drop-shadow-md line-clamp-1">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-white/90 line-clamp-2 drop-shadow-md max-w-[400px]">
                    {product.description}
                  </p>
                  <p className="text-sm font-semibold">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </div>

                {/* Footer Buttons - Improved hover effects */}
                <CardFooter className="absolute bottom-4 right-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full p-2 h-8 w-8"
                    onClick={() => handleOpenEdit(product)}>
                    <Edit2Icon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-full p-2 h-8 w-8"
                    onClick={() => {
                      setProductToDelete(product);
                      setDeleteOpen(true);
                    }}>
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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

      {/* Detail/Edit Product Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelEdit();
          }
          setEditOpen(open);
        }}>
        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-center">
              {selectedProduct ? "Edit Product" : "Product Details"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {selectedProduct ? "Edit the product data" : "View product details"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1 py-2">
            {selectedProduct && (
              <Form {...formEdit}>
                <form onSubmit={formEdit.handleSubmit(onEditSubmit)} className="space-y-4 mt-6">
                  {/* ... (salin semua field form dari Create Product Dialog) ... */}
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
                    control={formEdit.control}
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
                    control={formEdit.control}
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
                    control={formEdit.control}
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
                    control={formEdit.control}
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
                    control={formEdit.control}
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
                  <DialogFooter>
                    <Button type="submit" className="w-full">
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Alert Dialog Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this product data from our
              server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

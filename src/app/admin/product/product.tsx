"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Edit2Icon, ListFilterIcon, PlusCircle, Trash2Icon } from "lucide-react";
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
import {
  CreateProductInput,
  createProductSchema,
  EditProductInput,
  editProductSchema,
} from "@/lib/schema/product.schema";
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
import {
  CreateCategoryInput,
  createCategorySchema,
  EditCategoryInput,
  editCategorySchema,
} from "@/lib/schema/category.schema";

export function Product() {
  // =============== STATE MANAGEMENT ===============
  // Product states
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductOpen, setProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Category states
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // =============== FORM MANAGEMENT ===============
  // Product forms
  const productForm = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      stock: 0,
      categoryId: null,
    },
  });

  const editProductForm = useForm<EditProductInput>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      stock: 0,
      categoryId: null,
    },
  });

  // Category forms
  const categoryForm = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "" },
  });

  const editCategoryForm = useForm<EditCategoryInput>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: { name: "" },
  });

  // =============== DATA FETCHING ===============
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const params = new URLSearchParams();
        params.append("page", "1");
        params.append("limit", "9");
        if (searchTerm) params.append("search", searchTerm);
        if (filterCategory !== null) {
          params.append("categoryId", filterCategory.toString());
        }

        const productsResponse = await fetch(`/api/products?${params.toString()}`);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.product);
        }

        // Fetch categories
        const categoriesResponse = await fetch("/api/category");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isCategoryOpen, searchTerm, filterCategory]);

  // =============== PRODUCT FUNCTIONS ===============
  const handleCreateProduct = async (data: CreateProductInput) => {
    try {
      if (!image) {
        toast.error("Product image required!");
        return;
      }

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      formData.append("stock", String(data.stock));
      formData.append("imageUrl", image);

      if (data.categoryId !== null && data.categoryId !== undefined) {
        formData.append("categoryId", String(data.categoryId));
      }

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        toast.error("Failed to create product", { duration: 3000 });
        return;
      }

      toast.success("Product created successfully!", { duration: 3000 });
      setProductOpen(false);
      setImage(null);
      setPreview(null);
      productForm.reset();
      window.location.reload();
    } catch (error) {
      console.error("Product creation error:", error);
    }
  };

  const handleEditProduct = async (data: EditProductInput) => {
    try {
      if (!selectedProduct) return;

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      formData.append("stock", String(data.stock));
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
        toast.error("Failed to update product", { duration: 3000 });
        return;
      }

      toast.success("Product updated successfully!");
      setEditProductOpen(false);
      editProductForm.reset();
      window.location.reload();
    } catch (error) {
      console.error("Product edit error:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to delete product", { duration: 3000 });
        return;
      }

      toast.success("Product deleted successfully", { duration: 3000 });
      setDeleteProductOpen(false);
      setProductToDelete(null);
      window.location.reload();
    } catch (error) {
      console.error("Product deletion error:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleOpenProductEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditProductOpen(true);
    setPreview(product.imageUrl || null);

    editProductForm.reset({
      name: product.name,
      price: product.price,
      description: product.description,
      stock: product.stock,
      categoryId: product.categoryId || null,
    });
  };

  const handleCancelProductEdit = () => {
    setSelectedProduct(null);
    setImage(null);
    setPreview(null);
    editProductForm.reset({
      name: "",
      price: 0,
      description: "",
      stock: 0,
      categoryId: null,
    });
  };

  // =============== CATEGORY FUNCTIONS ===============
  const handleCreateCategory = async (data: CreateCategoryInput) => {
    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        toast.error("Failed to create category", { duration: 3000 });
        return;
      }

      toast.success("Category created successfully", { duration: 3000 });
      categoryForm.reset();
      const categoriesResponse = await fetch("/api/category");
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Category creation error:", error);
    }
  };

  const handleEditCategory = async (data: EditCategoryInput) => {
    if (!selectedCategory) return;
    try {
      const response = await fetch(`/api/category/${selectedCategory.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        toast.error("Failed to update category", { duration: 3000 });
        return;
      }

      toast.success("Category updated successfully!");
      setEditCategoryOpen(false);
      editCategoryForm.reset();
      const categoriesResponse = await fetch("/api/category");
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Category edit error:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const response = await fetch(`/api/category/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to delete category", { duration: 3000 });
        return;
      }

      toast.success("Category deleted successfully");
      const categoriesResponse = await fetch("/api/category");
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Category deletion error:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleOpenCategoryEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryOpen(true);
    editCategoryForm.reset({
      name: category.name,
    });
  };

  // =============== RENDER COMPONENT ===============
  return (
    <div>
      {/* =============== PRODUCT MANAGEMENT =============== */}
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
          {/* Search and Filter */}
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
                    ? categories.find((cat) => cat.id === Number(filterCategory))?.name
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
                {categories.map((cat) => (
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

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(products || []).map((product) => (
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

                <div className="absolute top-4 right-4">
                  <Badge className="px-3 py-2" variant="default">
                    Category: {product.category?.name || "Uncategorized"}
                  </Badge>
                </div>

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

                <CardFooter className="absolute bottom-4 right-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full p-2 h-8 w-8"
                    onClick={() => handleOpenProductEdit(product)}>
                    <Edit2Icon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-full p-2 h-8 w-8"
                    onClick={() => {
                      setProductToDelete(product);
                      setDeleteProductOpen(true);
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

      {/* =============== PRODUCT DIALOGS =============== */}
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
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(handleCreateProduct)} className="space-y-4">
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

                <FormField
                  control={productForm.control}
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

                <FormField
                  control={productForm.control}
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

                <FormField
                  control={productForm.control}
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

                <FormField
                  control={productForm.control}
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

                <FormField
                  control={productForm.control}
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
                          {categories
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

      {/* Edit Product Dialog */}
      <Dialog
        open={editProductOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelProductEdit();
          }
          setEditProductOpen(open);
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
              <Form {...editProductForm}>
                <form
                  onSubmit={editProductForm.handleSubmit(handleEditProduct)}
                  className="space-y-4 mt-6">
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

                  <FormField
                    control={editProductForm.control}
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

                  <FormField
                    control={editProductForm.control}
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

                  <FormField
                    control={editProductForm.control}
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

                  <FormField
                    control={editProductForm.control}
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

                  <FormField
                    control={editProductForm.control}
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
                            {categories
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

      {/* Delete Product Confirmation */}
      <AlertDialog open={deleteProductOpen} onOpenChange={setDeleteProductOpen}>
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
            <AlertDialogAction onClick={handleDeleteProduct}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* =============== CATEGORY DIALOGS =============== */}
      {/* Category Management Dialog */}
      <Dialog open={isCategoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Product Category</DialogTitle>
            <DialogDescription className="text-center">
              This is a list of product categories.
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4 max-h-60 overflow-y-auto space-y-2 pr-2">
            {categories.length ? (
              categories.map((item) => (
                <div key={item.id} className="p-2 border rounded flex justify-between items-center">
                  <span>{item.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCategoryEdit(item)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setCategoryToDelete(item);
                        setDeleteCategoryOpen(true);
                      }}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No categories found</p>
            )}
          </div>

          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(handleCreateCategory)} className="space-y-4">
              <FormField
                control={categoryForm.control}
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

      {/* Edit Category Dialog */}
      <Dialog
        open={editCategoryOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCategory(null);
            editCategoryForm.reset();
          }
          setEditCategoryOpen(open);
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Edit Product Category</DialogTitle>
          </DialogHeader>

          <Form {...editCategoryForm}>
            <form
              onSubmit={editCategoryForm.handleSubmit(handleEditCategory)}
              className="space-y-4">
              <FormField
                control={editCategoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={deleteCategoryOpen} onOpenChange={setDeleteCategoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure to delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this category and all
              products under it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

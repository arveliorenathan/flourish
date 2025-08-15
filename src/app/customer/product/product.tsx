"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Cart } from "@/types/cart";
import { ListFilterIcon, ShoppingCart, Trash2 } from "lucide-react";
import { fetchData } from "next-auth/client/_utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function Product() {
  // =============== STATE MANAGEMENT ===============
  // Session
  const session = useSession();
  console.log("Session: ", session);
  // Product States
  const [products, setProducts] = useState<Product[]>([]);
  const [detailProductOpen, setDetailProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Category States
  const [categories, setCategories] = useState<Category[]>([]);

  // Cart States
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  // Filter States
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

        const cartResponse = await fetch("/api/cart");
        if (cartResponse.ok) {
          const cartsData = await cartResponse.json();
          setCart(cartsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [session, searchTerm, filterCategory]);

  const handleDetailOpen = (product: Product) => {
    setSelectedProduct(product);
    setDetailProductOpen(true);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session?.data?.user.id,
        productId: selectedProduct.id,
        quantity: quantity,
      }),
    });

    if (res.ok) {
      toast.success("Successfully Add Item", {
        description: "Item added to shopping cart",
        duration: 3000,
      });

      const cartResponse = await fetch("/api/cart");
      if (cartResponse.ok) {
        const cartsData = await cartResponse.json();
        setCart(cartsData);
      }

      setQuantity(1);
      setDetailProductOpen(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const result = await fetch("/api/cart/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (result.ok) {
        toast.success("Successfully Delete Item", {
          duration: 3000,
        });
        const cartResponse = await fetch("/api/cart");
        if (cartResponse.ok) {
          const cartsData = await cartResponse.json();
          setCart(cartsData);
        }
      }
    } catch (error) {
      console.error("Gagal menghapus item:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-4 px-8">
      <header className="flex flex-col items-center text-center px-4 md:px-0 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Our Exquisite Products
        </h1>
        <p className="text-gray-700 text-base md:text-lg max-w-2xl leading-relaxed">
          Crafted with love and the finest ingredients, every cake and dessert from Flourish is a
          perfect harmony of flavor, aroma, and beauty. Each bite tells a sweet story worth
          savoring.
          <span className="font-semibold"> Order now</span> and celebrate your special
          moments with the luxury of taste!
        </p>
      </header>

      {/* Search Bar */}
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
              className={`text-sm ${filterCategory === null ? "font-semibold bg-gray-100" : ""}`}>
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

      {/* Card Product */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(products || [])
          .filter((product) => product.stock > 0)
          .map((product) => (
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
                <p className="text-sm font-semibold">Rp {product.price.toLocaleString("id-ID")}</p>
              </div>

              <CardFooter className="absolute bottom-4 right-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full p-2 h-8 w-8"
                  onClick={() => handleDetailOpen(product)}>
                  <ShoppingCart className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>

      <Button
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full p-0 shadow-lg flex items-center justify-center"
        onClick={() => setCartOpen(true)}>
        <ShoppingCart className="h-7 w-7" />
      </Button>

      {/* Dialog Detail Product */}
      <Dialog open={detailProductOpen} onOpenChange={setDetailProductOpen}>
        <DialogContent className="max-w-lg">
          {selectedProduct && (
            <div className="flex flex-col gap-6">
              {/* Judul */}
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold">
                  {selectedProduct.name}
                </DialogTitle>
              </DialogHeader>

              {/* Gambar & Info */}
              <div className="w-full flex justify-center">
                <div className="relative w-full max-w-sm h-64">
                  <Image
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover rounded-md shadow-md"
                  />
                </div>
              </div>

              <p className="text-sm text-justify">{selectedProduct.description}</p>

              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="default" className="text-sm px-3 py-1">
                  💰 Rp {selectedProduct.price.toLocaleString("id-ID")}
                </Badge>
                <Badge
                  variant={selectedProduct.stock > 0 ? "default" : "destructive"}
                  className="text-sm px-3 py-1">
                  📦 Stock: {selectedProduct.stock}
                </Badge>
                <Badge variant="default" className="text-sm px-3 py-1">
                  🏷️ {selectedProduct.category?.name || "Uncategorized"}
                </Badge>
              </div>

              {/* Kontrol Quantity */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                  -
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((prev) => prev + 1)}>
                  +
                </Button>
              </div>

              {/* Tombol aksi */}
              <div className="flex justify-center gap-3">
                <Button onClick={() => handleAddToCart()}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add To Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Cart */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">Your Shopping Cart</DialogTitle>
          </DialogHeader>

          {cart && cart.items.length > 0 ? (
            <div className="space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b pb-3">
                    {/* Gambar Produk */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {item.product?.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>

                    {/* Info Produk */}
                    <div className="flex-1">
                      <p className="font-semibold">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        Rp {item.product?.price.toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>

                    {/* Subtotal */}
                    <div className="font-semibold">
                      Rp {((item.product?.price || 0) * item.quantity).toLocaleString("id-ID")}
                    </div>

                    {/* Tombol Delete */}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
                <span>Total:</span>
                <span>
                  Rp{" "}
                  {cart.items
                    .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
                    .toLocaleString("id-ID")}
                </span>
              </div>

              {/* Tombol Checkout */}
              <Button className="w-full">Checkout</Button>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-6">Your cart is empty 🛒</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

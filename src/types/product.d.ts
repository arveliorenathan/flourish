interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  stock: number;
  imageUrl: string;
  price: number;
  createdAt: string;
  categoryId: number;
  category: Category;
}

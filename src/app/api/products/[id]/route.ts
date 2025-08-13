import { prisma } from "@/lib/db";
import { editProductSchema } from "@/lib/schema/product.schema";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Validate product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const formData = await req.formData();

    // Extract form data with proper type checking
    const name = formData.get("name")?.toString() || existingProduct.name;
    const price = Number(formData.get("price")) || existingProduct.price;
    const description = formData.get("description")?.toString() || existingProduct.description;
    const stock = Number(formData.get("stock")) || existingProduct.stock;
    const categoryId = formData.get("categoryId")
      ? Number(formData.get("categoryId"))
      : existingProduct.categoryId;
    const imageFile = formData.get("imageUrl") as File | null;

    // Validate input data
    const validation = editProductSchema.safeParse({
      name,
      price,
      description,
      stock,
      categoryId,
    });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    let imageUrl = existingProduct.imageUrl;

    // Handle image upload if new image is provided
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const bucketName = "flourish";
      const filePath = `productImage/${fileName}`;

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      // Get public URL of new image
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;

      // Optional: Delete old image from storage
      try {
        const oldImagePath = existingProduct.imageUrl.split("/").pop();
        if (oldImagePath) {
          await supabase.storage.from(bucketName).remove([`productImage/${oldImagePath}`]);
        }
      } catch (deleteError) {
        console.error("Failed to delete old image:", deleteError);
      }
    }

    // Update product in database
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        price,
        description,
        stock,
        categoryId,
        imageUrl,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product: updatedProduct,
        message: "Product updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error editing product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

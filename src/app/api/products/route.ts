import { prisma } from "@/lib/db";
import { createProduct } from "@/lib/schema/product.schema";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    //Get Product Data
    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const description = formData.get("description") as string;
    const stock = Number(formData.get("stock"));
    const imageFile = formData.get("imageUrl") as File;
    const categoryIdInput = formData.get("categoryId");

    const categoryId = categoryIdInput ? Number(categoryIdInput) : null;

    //Schema Validation
    const validation = createProduct.safeParse({
      name,
      price,
      description,
      stock,
      categoryId: categoryId !== null ? categoryId : null,
    });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    //Upload to Bucket
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const bucketName = "flourish";
    const filePath = `productImage/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const publicUrl = supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;

    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        description,
        stock,
        categoryId,
        imageUrl: publicUrl,
      },
    });

    return NextResponse.json(
      { data: newProduct, message: "Course created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/product error:", error);
    return NextResponse.json({ error, message: "Course creation failed" }, { status: 500 });
  }
}

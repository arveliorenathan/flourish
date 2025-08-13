import { prisma } from "@/lib/db";
import { createProductSchema } from "@/lib/schema/product.schema";
import { Prisma } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const priceRaw = formData.get("price");
    const description = formData.get("description") as string;
    const stockRaw = formData.get("stock");
    const imageFile = formData.get("imageUrl") as File | null;
    const categoryRaw = formData.get("categoryId");

    // Convert price dan stock ke number, jika gagal parse jadi NaN
    const price = priceRaw ? Number(priceRaw) : NaN;
    const stock = stockRaw ? Number(stockRaw) : NaN;

    // Convert categoryId ke number|null
    const categoryId = categoryRaw !== null && categoryRaw !== "" ? Number(categoryRaw) : null;

    const validation = createProductSchema.safeParse({
      name,
      price,
      description,
      stock,
      categoryId,
    });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

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

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

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
      { data: newProduct, message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Product creation failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 9;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : null;

    const skip = (page - 1) * limit;
    
    const whereCondition: Prisma.ProductWhereInput = {
      name: {
        contains: search,
        mode: "insensitive",
      },
    };

    // Add category filter conditionally
    if (categoryId !== null) {
      whereCondition.categoryId = categoryId;
    }

    const total = await prisma.product.count({
      where: whereCondition,
    });

    const product = await prisma.product.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/product error:", error);
    return NextResponse.json({ error, message: "Failed to fetch product data" }, { status: 500 });
  }
}

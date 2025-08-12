import { prisma } from "@/lib/db";
import { createCategorySchema } from "@/lib/schema/category.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    //Validation Schema
    const { name } = createCategorySchema.parse(body);

    //Check if category already exist
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { user: null, message: "Category is already exist." },
        { status: 409 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
      },
    });

    return NextResponse.json(
      { category: newCategory, message: "Create category successfuly" },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/category error:", error);
    return NextResponse.json({ error, message: "Category creation failed" }, { status: 500 });
  }
}

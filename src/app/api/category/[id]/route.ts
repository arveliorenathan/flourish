import { prisma } from "@/lib/db";
import { editCategorySchema } from "@/lib/schema/category.schema";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();

    const { name } = editCategorySchema.parse(body);

    const existingCategory = await prisma.category.findUnique({
      where: { id: Number(id) },
    });
    if (!existingCategory) {
      return NextResponse.json({ message: "Category not found." }, { status: 404 });
    }

    const categoryWithSameName = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        NOT: { id: Number(id) },
      },
    });

    if (categoryWithSameName) {
      return NextResponse.json({ message: "Category name is already in use." }, { status: 409 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name },
    });

    return NextResponse.json(
      { category: updatedCategory, message: "Category updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/category error:", error);
    return NextResponse.json({ error, message: "Category update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
    });

    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

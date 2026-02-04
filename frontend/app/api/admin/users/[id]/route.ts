import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Context) {
  const { id } = await params;

  if (!id || id === "undefined") {
    return NextResponse.json(
      { success: false, message: "Missing user id" },
      { status: 400 }
    );
  }

  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: Request, { params }: Context) {
  const { id } = await params;

  if (!id || id === "undefined") {
    return NextResponse.json(
      { success: false, message: "Missing user id" },
      { status: 400 }
    );
  }

  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await req.formData();

  const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id } = await params;

  if (!id || id === "undefined") {
    return NextResponse.json(
      { success: false, message: "Missing user id" },
      { status: 400 }
    );
  }

  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

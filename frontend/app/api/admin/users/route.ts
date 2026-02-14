import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: NextRequest) {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const page = req.nextUrl.searchParams.get("page") || "1";
  const limit = req.nextUrl.searchParams.get("limit") || "10";

  const res = await fetch(`${BACKEND_URL}/api/admin/users?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();

  const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, 
    body: formData,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

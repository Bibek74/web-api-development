"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function AdminUserByIdPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>/admin/[id]</h1>
        {id ? (
          <Link href={`/admin/${id}/edit`} style={{ textDecoration: "underline" }}>
            Edit
          </Link>
        ) : null}
      </div>

      <p style={{ marginTop: 12 }}>ID: {id ?? "Loading..."}</p>
    </div>
  );
}

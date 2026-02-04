"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";

type UserDTO = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  image?: string;
  createdAt?: string;
};

export default function AdminUserByIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  const fetchUser = async (userId: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/admin/users/${userId}`);
      setUser(res.data?.data ?? null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this user?")) return;
    
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/admin/users/${id}`);
      router.push("/admin/users");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete user");
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>User Details</h1>
        <div style={{ display: "flex", gap: 12 }}>
          {id && !loading && user && (
            <>
              <Link 
                href={`/admin/${id}/edit`} 
                style={{ 
                  padding: "8px 16px", 
                  border: "1px solid #ccc", 
                  borderRadius: 6,
                  textDecoration: "none" 
                }}
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ 
                  padding: "8px 16px", 
                  border: "1px solid #dc2626", 
                  borderRadius: 6,
                  backgroundColor: "#dc2626",
                  color: "white",
                  cursor: deleting ? "not-allowed" : "pointer"
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </>
          )}
          <Link 
            href="/admin/users"
            style={{ 
              padding: "8px 16px", 
              border: "1px solid #ccc", 
              borderRadius: 6,
              textDecoration: "none" 
            }}
          >
            Back to Users
          </Link>
        </div>
      </div>

      {loading && <p style={{ marginTop: 12 }}>Loading...</p>}
      {error && <p style={{ marginTop: 12, color: "#dc2626" }}>{error}</p>}

      {!loading && !error && user && (
        <div style={{ marginTop: 24, maxWidth: 600 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: 12, fontWeight: 600 }}>ID:</td>
                <td style={{ padding: 12 }}>{user._id}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: 12, fontWeight: 600 }}>Name:</td>
                <td style={{ padding: 12 }}>{user.name || "-"}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: 12, fontWeight: 600 }}>Email:</td>
                <td style={{ padding: 12 }}>{user.email || "-"}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: 12, fontWeight: 600 }}>Role:</td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: 12,
                    backgroundColor: user.role === "admin" ? "#dbeafe" : "#f3f4f6",
                    color: user.role === "admin" ? "#1e40af" : "#374151",
                    fontSize: 14
                  }}>
                    {user.role || "user"}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: 12, fontWeight: 600 }}>Created At:</td>
                <td style={{ padding: 12 }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

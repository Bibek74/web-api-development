"use client";

import Link from "next/link";
<<<<<<< HEAD
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API } from "@/lib/api/endpoints";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUserByIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(API.ADMIN.USERS.BY_ID(id));
        const data = await response.json();
        
        if (data.success && data.data) {
          setUser(data.data);
        } else {
          setError(data.message || "Failed to fetch user");
        }
      } catch (err) {
        setError("An error occurred while fetching user");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this user?")) return;

    try {
      setDeleting(true);
      const response = await fetch(API.ADMIN.USERS.DELETE(id), {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        alert("User deleted successfully");
        router.push("/admin/users");
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      alert("An error occurred while deleting user");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, backgroundColor: "#1a1a1a", minHeight: "100vh" }}>
        <p style={{ color: "white" }}>Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ padding: 24, backgroundColor: "#1a1a1a", minHeight: "100vh" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#ef4444" }}>Error</h1>
        <p style={{ marginTop: 12, color: "white" }}>{error || "User not found"}</p>
        <Link href="/admin/users" style={{ textDecoration: "underline", marginTop: 12, display: "inline-block", color: "#60a5fa" }}>
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, backgroundColor: "#1a1a1a", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "white" }}>User Details</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link 
            href="/admin/users" 
            style={{ 
              padding: "8px 16px", 
              border: "1px solid #404040", 
              borderRadius: 4,
              textDecoration: "none",
              backgroundColor: "#2a2a2a",
              color: "white"
            }}
          >
            Back to Users
          </Link>
          <Link 
            href={`/admin/${id}/edit`} 
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#0070f3", 
              color: "white", 
              borderRadius: 4,
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
              backgroundColor: deleting ? "#404040" : "#dc2626",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div style={{ 
        border: "1px solid #404040", 
        borderRadius: 8, 
        padding: 24,
        backgroundColor: "#2a2a2a"
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4, color: "white" }}>ID:</label>
          <p style={{ color: "#a0a0a0" }}>{user._id}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4, color: "white" }}>Name:</label>
          <p style={{ color: "white" }}>{user.name}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4, color: "white" }}>Email:</label>
          <p style={{ color: "white" }}>{user.email}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4, color: "white" }}>Role:</label>
          <p style={{ 
            display: "inline-block",
            padding: "4px 12px",
            backgroundColor: user.role === "admin" ? "#10b981" : "#3b82f6",
            color: "white",
            borderRadius: 4,
            fontSize: 14
          }}>
            {user.role}
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4, color: "white" }}>Created At:</label>
          <p style={{ color: "#a0a0a0" }}>{new Date(user.createdAt).toLocaleString()}</p>
        </div>

        <div>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 4, color: "white" }}>Updated At:</label>
          <p style={{ color: "#a0a0a0" }}>{new Date(user.updatedAt).toLocaleString()}</p>
        </div>
      </div>
=======
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
>>>>>>> 73a061defa90ed1972e6196403ab71724714d0af
    </div>
  );
}

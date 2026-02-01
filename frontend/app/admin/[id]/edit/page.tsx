"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axiosInstance from "@/lib/api/axios";

type UserDTO = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  image?: string;
  createdAt?: string;
};

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [user, setUser] = useState<UserDTO | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      name !== (user.name ?? "") ||
      email !== (user.email ?? "") ||
      role !== (user.role ?? "user") ||
      password.length > 0 ||
      !!image
    );
  }, [user, name, email, role, password, image]);

  const fetchUser = async (userId: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/admin/users/${userId}`);
      const u: UserDTO | undefined = res.data?.data;
      if (!u) throw new Error("User not found");

      setUser(u);
      setName(u.name ?? "");
      setEmail(u.email ?? "");
      setRole((u.role as any) ?? "user");
      setPassword("");
      setImage(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return; // wait until params are available
    fetchUser(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("role", role);
      if (password.trim()) formData.append("password", password.trim());
      if (image) formData.append("image", image);

      const res = await axiosInstance.put(`/api/admin/users/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data?.data as UserDTO | undefined;
      if (updated) {
        setUser(updated);
        setName(updated.name ?? "");
        setEmail(updated.email ?? "");
        setRole((updated.role as any) ?? "user");
        setPassword("");
        setImage(null);
      } else {
        await fetchUser(id);
      }

      router.push(`/admin/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>/admin/[id]/edit</h1>
        <p style={{ marginTop: 12 }}>Loading route params...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>/admin/[id]/edit</h1>
        <p style={{ marginTop: 12 }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>/admin/[id]/edit</h1>
        <p style={{ marginTop: 12 }}>ID: {id}</p>
        <p style={{ marginTop: 12 }}>{error}</p>
        <button
          onClick={() => fetchUser(id)}
          style={{ marginTop: 12, padding: "8px 12px", border: "1px solid #ccc", borderRadius: 8 }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>/admin/[id]/edit</h1>
        <p style={{ marginTop: 12 }}>User not found</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>/admin/[id]/edit</h1>
      <p style={{ marginTop: 12 }}>ID: {id}</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 420 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
              required
            />
          </label>

          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
              required
            />
          </label>

          <label>
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "admin")}
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <label>
            New Password (optional)
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="leave blank to keep current"
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
            />
          </label>

          <label>
            Replace Image (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => router.push(`/admin/${id}`)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", cursor: "pointer" }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !hasChanges}
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ccc",
                cursor: saving || !hasChanges ? "not-allowed" : "pointer",
                opacity: saving || !hasChanges ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {error ? <p>{error}</p> : null}
        </div>
      </form>
    </div>
  );
}

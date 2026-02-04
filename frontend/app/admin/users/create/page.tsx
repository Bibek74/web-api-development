"use client";

import { useState } from "react";
import axiosInstance from "@/lib/api/axios";

export default function AdminCreateUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [image, setImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // ✅ Use FormData even if no image
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (image) formData.append("image", image);

      // ✅ IMPORTANT: send token in Authorization header
      // token is stored as httpOnly cookie, so client JS can't read it.
      // So for now: simplest is to also store a non-httpOnly token cookie OR store token in localStorage.
      // If you haven't done that, create a Next API route proxy (I'll give you if needed).

      const res = await axiosInstance.post("/api/admin/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data?.message || "User created");
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setImage(null);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Create User (Admin)</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 420 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="john"
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
              required
            />
          </label>

          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@test.com"
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
              required
            />
          </label>

          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="password123"
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
            Image (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Create User"}
          </button>

          {message ? <p>{message}</p> : null}
        </div>
      </form>
    </div>
  );
}

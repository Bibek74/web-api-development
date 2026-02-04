"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCreateUserPage() {
  const router = useRouter();
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
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (image) formData.append("image", image);

      const res = await fetch("/api/admin/users", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage(data.message || "User created successfully");
        setName("");
        setEmail("");
        setPassword("");
        setRole("user");
        setImage(null);
        
        // Redirect to users list after 1 second
        setTimeout(() => {
          router.push("/admin/users");
        }, 1000);
      } else {
        setMessage(data.message || "Failed to create user");
      }
    } catch (err: any) {
      setMessage(err?.message || "Something went wrong");
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
              autoComplete="name"
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
              required
            />
          </label>

          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="john@test.com"
              autoComplete="email"
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
              autoComplete="new-password"
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

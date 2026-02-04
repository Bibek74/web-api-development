"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/api/axios";

type UserRow = {
  _id: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
  createdAt?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchUsers = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/admin/users");
      setUsers(res.data?.data ?? []);
    } catch (err: unknown) {
      // try to read server message (proxy response)
      // @ts-expect-error - axios error shape
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || (err instanceof Error ? err.message : "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Admin Users</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={fetchUsers}
            style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 8 }}
          >
            Refresh
          </button>

          <Link
            href="/admin/users/create"
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            + Create User
          </Link>
        </div>
      </div>

      {loading ? <p style={{ marginTop: 12 }}>Loading...</p> : null}
      {error ? <p style={{ marginTop: 12 }}>{error}</p> : null}

      {!loading && !error ? (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Role</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td style={td} colSpan={5}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td style={td}>{u._id}</td>
                    <td style={td}>{u.name ?? "-"}</td>
                    <td style={td}>{u.email ?? "-"}</td>
                    <td style={td}>{u.role ?? "-"}</td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 10 }}>
                      <Link href={`/admin/${u._id}`} style={a}>
                          View
                      </Link>
                      <Link href={`/admin/${u._id}/edit`} style={a}>
                          Edit
                      </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: 10,
  borderBottom: "1px solid #ddd",
  fontWeight: 700,
};

const td: React.CSSProperties = {
  padding: 10,
  borderBottom: "1px solid #eee",
};

const a: React.CSSProperties = {
  textDecoration: "underline",
};

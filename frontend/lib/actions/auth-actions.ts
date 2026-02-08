"use server";

import { loginUser, registerUser } from "@/lib/api/auth";
import { cookies } from "next/headers";

export const handleRegister = async (formData: { name: string; email: string; password: string; confirmPassword: string }) => {
  try {
    const res = await registerUser(formData);
    return {
      success: true,
      message: res.message,
      data: res.data,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong",
    };
  }
};

export const handleLogin = async (formData: { email: string; password: string }) => {
  try {
    const res = await loginUser(formData);

    // Check if login was successful and data exists
    if (!res.success || !res.data) {
      return {
        success: false,
        message: res.message || "Login failed",
      };
    }

    const cookieStore = await cookies();

    // Store auth_token (accessible from client side)
    cookieStore.set("auth_token", res.token, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      maxAge: 3000, // Same as backend token expiry (in seconds)
    });

    // Store user info and role (not httpOnly so client can read)
    cookieStore.set("user", JSON.stringify(res.data), {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
    });

    cookieStore.set("role", res.data.role, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
    });

    return {
      success: true,
      message: res.message,
      data: res.data,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Something went wrong",
    };
  }
};

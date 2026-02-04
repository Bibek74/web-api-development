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

    const cookieStore = await cookies();

    cookieStore.set("token", res.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    cookieStore.set("user", JSON.stringify(res.data), {
      httpOnly: false,
      path: "/",
    });

    cookieStore.set("role", res.data.role, {
      httpOnly: false,
      path: "/",
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

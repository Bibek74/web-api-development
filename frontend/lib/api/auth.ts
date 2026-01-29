import axios, { AxiosError } from "axios";
import axiosInstance from "./axios";
import { API } from "./endpoints";

// ---------- Types ----------
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Backend response types
export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: {
    id: string;
    name: string;
    email: string;
  };
}

// ---------- API Calls ----------
export const registerUser = async (data: RegisterFormData): Promise<RegisterResponse> => {
  try {
    const res = await axiosInstance.post<RegisterResponse>(API.AUTH.REGISTER, data);
    return res.data;
  } catch (err: unknown) {
    let message = "Registration failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

export const loginUser = async (data: LoginFormData): Promise<LoginResponse> => {
  try {
    const res = await axiosInstance.post<LoginResponse>(API.AUTH.LOGIN, data);
    return res.data;
  } catch (err: unknown) {
    let message = "Login failed";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};

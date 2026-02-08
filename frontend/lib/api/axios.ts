import axios from "axios";

const SERVER_BASE_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Use the backend URL for both server and client side
const baseURL = SERVER_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;

import axios from "axios";

const SERVER_BASE_URL =
<<<<<<< HEAD
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";


const baseURL = typeof window === "undefined" ? SERVER_BASE_URL : "http://localhost:5000";
=======
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;


const baseURL = typeof window === "undefined" ? SERVER_BASE_URL : "";
>>>>>>> 73a061defa90ed1972e6196403ab71724714d0af

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;

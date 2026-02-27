import axios from "axios";
import { BASE_URL } from "@/config";
import router from "@/router";

const api = axios.create({
  baseURL: BASE_URL + "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["ngrok-skip-browser-warning"] = "true";

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      router.push("/");
    }
    return Promise.reject(error);
  }
);

export default api;
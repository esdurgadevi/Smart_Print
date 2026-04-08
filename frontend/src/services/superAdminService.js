import axios from "axios";

const API_URL = "http://localhost:5000/api/admin"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPlatformAnalytics = async () => {
  const response = await api.get("/analytics");
  return response.data;
};

export default {
  getPlatformAnalytics,
};

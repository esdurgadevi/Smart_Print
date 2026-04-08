import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

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

export const getUserProfileAndAnalytics = async () => {
  const response = await api.get("/profile");
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.put("/profile", userData);
  return response.data;
};

export default {
  getUserProfileAndAnalytics,
  updateUserProfile,
};

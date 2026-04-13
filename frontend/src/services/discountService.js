import axios from "axios";

const API_URL = "http://localhost:5000/api/discounts";

const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getDiscounts = async () => {
  const res = await api.get("/");
  return res.data;
};

export const createDiscount = async (data) => {
  const res = await api.post("/", data);
  return res.data;
};

export const toggleDiscount = async (id) => {
  const res = await api.patch(`/${id}/toggle`);
  return res.data;
};

export const deleteDiscount = async (id) => {
  const res = await api.delete(`/${id}`);
  return res.data;
};

export default { getDiscounts, createDiscount, toggleDiscount, deleteDiscount };

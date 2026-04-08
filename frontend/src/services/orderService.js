import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadDocument = async (formData) => {
  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const placeOrder = async (orderData) => {
  const response = await api.post("/", orderData);
  return response.data;
};

export const placeBatchOrder = async (items) => {
  const response = await api.post("/batch", { items });
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/my-orders");
  return response.data;
};

export const getShopOrders = async () => {
  const response = await api.get("/shop-orders");
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/${orderId}/status`, { status });
  return response.data;
};

export const getLiveTracking = async (orderId) => {
  const response = await api.get(`/${orderId}/live-tracking`);
  return response.data;
};

export default {
  uploadDocument,
  placeOrder,
  placeBatchOrder,
  getMyOrders,
  getShopOrders,
  updateOrderStatus,
  getLiveTracking,
};

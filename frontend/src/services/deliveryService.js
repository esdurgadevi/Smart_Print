import axios from "axios";

const API_URL = "http://localhost:5000/api/delivery";

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

export const getDeliveryProfile = async () => {
  const response = await api.get("/profile");
  return response.data;
};

export const updateDeliveryProfile = async (profileData) => {
  const response = await api.put("/profile", profileData);
  return response.data;
};

export const updateLocation = async (locationData) => {
  const response = await api.put("/location", locationData);
  return response.data;
};

export const getNearbyOrders = async () => {
  const response = await api.get(`/orders/nearby`);
  return response.data;
};

export const acceptOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/accept`);
  return response.data;
};

export const getMyDeliveries = async () => {
  const response = await api.get("/orders/my-deliveries");
  return response.data;
};

export const updateDeliveryStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const verifyPickup = async (orderId, otp) => {
  const response = await api.post(`/orders/${orderId}/verify-pickup`, { otp });
  return response.data;
};

export const verifyDelivery = async (orderId, otp) => {
  const response = await api.post(`/orders/${orderId}/verify-delivery`, { otp });
  return response.data;
};

export default {
  getDeliveryProfile,
  updateDeliveryProfile,
  updateLocation,
  getNearbyOrders,
  acceptOrder,
  getMyDeliveries,
  updateDeliveryStatus,
  verifyPickup,
  verifyDelivery,
};

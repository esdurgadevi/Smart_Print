import axios from "axios";

const API_URL = "http://localhost:5000/api/feedback";

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

export const submitFeedback = async (feedbackData) => {
  const response = await api.post("/", feedbackData);
  return response.data;
};

export const getShopFeedback = async (shopId) => {
  const response = await api.get(`/shop/${shopId}`);
  return response.data;
};

export default {
  submitFeedback,
  getShopFeedback,
};

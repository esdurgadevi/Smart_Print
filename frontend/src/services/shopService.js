import axios from "axios";

const API_URL = "http://localhost:5000/api/shops"; // Make sure to use env variable in prod

// axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createShop = async (shopData) => {
  console.log(shopData);
  const response = await api.post("/", shopData);
  console.log(response);
  return response.data;
};

export const updateShop = async (shopData) => {
  const response = await api.put("/", shopData);
  return response.data;
};

export const getMyShop = async () => {
  const response = await api.get(`/my-shop`);
  return response.data;
};

export const addService = async (serviceData) => {
  const response = await api.post(`/services`, serviceData);
  return response.data;
};

export const updateService = async (serviceId, serviceData) => {
  console.log(serviceId, serviceData);
  const response = await api.put(`/services/${serviceId}`, serviceData);
  return response.data;
};

export const getAllShops = async (lat, lng, service, sort) => {
  let url = "/";
  const params = new URLSearchParams();
  if (lat && lng) {
    params.append('lat', lat);
    params.append('lng', lng);
  }
  if (service) {
    params.append('service', service);
  }
  if (sort) {
    params.append('sort', sort);
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await api.get(url);
  return response.data;
};

export const getShopDetails = async (shopId) => {
  const response = await api.get(`/${shopId}`);
  return response.data;
};

export default {
  createShop,
  updateShop,
  getMyShop,
  addService,
  updateService,
  getAllShops,
  getShopDetails,
};

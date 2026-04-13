import axios from "axios";

const API_URL = "http://localhost:5000/api/inventory";

const getInventory = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_URL}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const addInventoryItem = async (data) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post(`${API_URL}/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateInventoryItem = async (id, data) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteInventoryItem = async (id) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default {
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};

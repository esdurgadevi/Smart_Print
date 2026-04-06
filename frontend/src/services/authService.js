import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

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

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Log all errors for debugging
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        // If no refresh token, user is not logged in
        if (!refreshToken) {
          console.warn("⚠️ No refresh token found - user not authenticated");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          // Redirect after 2 seconds so user can see the error
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/refresh-token`, {
          refreshToken,
        });
        
        localStorage.setItem("accessToken", response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError.response?.data || refreshError.message);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        // Redirect after 2 seconds so user can see the error
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Register (send OTP)
  register: async (data) => {
    try {
      console.log("📤 Sending register request:", data);
      const res = await api.post("/register", data);
      console.log("✅ Register response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Register failed:", error.response?.data || error.message);
      throw error;
    }
  },

  // Verify OTP (registration)
  verifyOTP: async (data) => {
    try {
      console.log("📤 Sending verify OTP request:", data);
      const res = await api.post("/verify-otp", data);
      console.log("✅ Verify OTP response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Verify OTP failed:", error.response?.data || error.message);
      throw error;
    }
  },

  // Login
  login: async (data) => {
    try {
      console.log("📤 Sending login request:", data);
      const res = await api.post("/login", data);
      console.log("✅ Login response received:", res.data);
      
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      console.log("✅ Tokens saved to localStorage");
      return res.data;
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      throw error;
    }
  },

  // Forgot Password (send OTP)
  forgotPassword: async (email) => {
    const res = await api.post("/forgot-password", { email });
    return res.data;
  },

  // Verify OTP (forgot password)
  verifyForgotOTP: async (data) => {
    const res = await api.post("/verify-forgot-otp", data);
    return res.data;
  },

  // Reset Password
  resetPassword: async (data) => {
    const res = await api.post("/reset-password", data);
    return res.data;
  },

  // Change Password (logged in)
  changePassword: async (data) => {
    const res = await api.post("/change-password", data);
    return res.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },
};

export default authService;
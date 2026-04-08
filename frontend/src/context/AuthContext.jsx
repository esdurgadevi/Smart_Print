import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { getUserData, clearUserData } from "../utils/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = getUserData();
    const token = localStorage.getItem("accessToken");
    
    if (token && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log("🔐 Starting login...");
      const data = await authService.login({ email, password });
      console.log("✅ Login successful, user:", data.user);
      setUser(data.user);
      
      // Redirect based on role
      const role = data.user.role?.toLowerCase();
      if (role === "super_admin") {
        navigate("/super-admin/dashboard");
      } else if (role === "shop_admin") {
        navigate("/shop-admin/dashboard");
      } else if (role === "delivery_person") {
        navigate("/delivery/dashboard");
      } else {
        navigate("/dashboard");
      }
      
      return data;
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data?.message || error.message);
      throw error; // Let the Login component handle the error display
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      clearUserData();
      navigate("/");
      // Force a reload so all contexts drop their state
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
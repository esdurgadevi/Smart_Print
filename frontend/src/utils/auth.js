export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  return !!token;
};

export const getUserRole = () => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.role?.toLowerCase() || "user";
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const getUserData = () => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      return JSON.parse(user);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const clearUserData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};
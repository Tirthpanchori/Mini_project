import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import { getAccessToken, getRefreshToken } from "../utils/token";
import { useState, useEffect } from "react";


function ProtectedRoute({ children,allowedRole }) {
  const [isAuthorised, setIsAuthorised] = useState(null);

  useEffect(() => {
    const authenticate = async () => {
      try {
        await auth();
      } catch (err) {
        console.error("Authentication error:", err);
        setIsAuthorised(false);
      }
    };
    authenticate();
  }, []);

  const refreshToken = async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      setIsAuthorised(false);
      return;
    }
    try {
      const response = await api.post("/accounts/token/refresh/", { refresh });
      localStorage.setItem("access_token", response.data.access);
      setIsAuthorised(true);
    } catch (error) {
      console.error("Token refresh failed:", error);
      setIsAuthorised(false);
    }
  };

  const auth = async () => {
    const access = getAccessToken();
    if (!access) {
      setIsAuthorised(false);
      return;
    }
    const decoded = jwtDecode(access);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      await refreshToken();
      return;
    }

    //  Check role
    const storedRole = localStorage.getItem("role");
    if (allowedRole && storedRole?.toLowerCase() !== allowedRole.toLowerCase()) {
      setIsAuthorised(false);
      return;
    }

    setIsAuthorised(true);
  };

  if (isAuthorised === null) return <div>Loading...</div>;

  return isAuthorised ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;

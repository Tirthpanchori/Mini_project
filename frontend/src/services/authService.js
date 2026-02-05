import api from "./api";
import { setTokens, clearTokens } from "../utils/token";

export const login = async (email, password) => {
  const res = await api.post("/accounts/token/", { email, password });
  setTokens(res.data.access, res.data.refresh);
  return res.data;
};

// export const logout = () => {
//   clearTokens();
// };

export const register = async (username, password, email) => {
  const res = await api.post("/accounts/register/", { username, password, email });
  return res.data;
}
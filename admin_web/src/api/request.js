import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "https://api.minserver.click/api";
const request = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});
const refreshClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});
let refreshing = null;

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  const expiresAt = Number(localStorage.getItem("adminSessionExpiresAt") || 0);
  if (expiresAt && Date.now() >= expiresAt) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("adminSessionExpiresAt");
    if (!location.pathname.startsWith("/login")) location.href = "/login";
    return Promise.reject(new axios.Cancel("Admin session expired"));
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      localStorage.getItem("refreshToken")
    ) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = refreshClient
            .post("/auth/refresh", {
              refreshToken: localStorage.getItem("refreshToken"),
            })
            .then((r) => {
              const d = r.data?.data ?? r.data;
              const accessToken = d?.accessToken || d?.token;
              const refreshToken =
                d?.refreshToken || localStorage.getItem("refreshToken");
              if (!accessToken)
                throw new Error("Không nhận được access token mới");
              localStorage.setItem("adminToken", accessToken);
              if (refreshToken)
                localStorage.setItem("refreshToken", refreshToken);
              return accessToken;
            })
            .finally(() => {
              refreshing = null;
            });
        }
        const token = await refreshing;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return request(original);
      } catch (refreshError) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("adminSessionExpiresAt");
        if (!location.pathname.startsWith("/login")) location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("adminSessionExpiresAt");
      if (!location.pathname.startsWith("/login")) location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default request;

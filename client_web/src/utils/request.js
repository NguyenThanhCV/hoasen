import axios from "axios";

// Configure the API endpoint per environment in .env; the source stays portable.
const API_URL = (process.env.REACT_APP_API_URL || "/api").replace(/\/+$/, "");

const request = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

let refreshing = null;

const saveTokens = (data = {}) => {
  if (data.accessToken) localStorage.setItem("token", data.accessToken);
  if (data.refreshToken)
    localStorage.setItem("refreshToken", data.refreshToken);
};

const clearSession = () => {
  ["token", "refreshToken", "user"].forEach((key) =>
    localStorage.removeItem(key),
  );
  window.dispatchEvent(new Event("auth-change"));
};

const refreshAccessToken = async () => {
  if (!refreshing) {
    refreshing = axios
      .post(`${API_URL}/auth/refresh`, {
        refreshToken: localStorage.getItem("refreshToken"),
      })
      .then(({ data }) => {
        saveTokens(data?.data || {});
        return data?.data?.accessToken;
      })
      .catch((error) => {
        clearSession();
        throw error;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original?._retry &&
      localStorage.getItem("refreshToken")
    ) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return request(original);
      } catch (_) {
        // The original error is returned after the session is cleared.
      }
    }
    return Promise.reject(error);
  },
);

export { API_URL, saveTokens, clearSession };
export default request;

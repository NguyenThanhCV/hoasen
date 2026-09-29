import request, { saveTokens, clearSession } from "../utils/request";

const unwrap = (response) => response.data;
const dataOf = (result) => result?.data ?? result;

export const login = async (payload) => {
  const result = unwrap(await request.post("/auth/login", payload));
  saveTokens(result.data || {});
  if (result.data?.user) localStorage.setItem("user", JSON.stringify(result.data.user));
  window.dispatchEvent(new Event("auth-change"));
  return result;
};

export const register = async (payload) => {
  const result = unwrap(await request.post("/auth/register", payload));
  saveTokens(result.data || {});
  if (result.data?.user) localStorage.setItem("user", JSON.stringify(result.data.user));
  window.dispatchEvent(new Event("auth-change"));
  return result;
};

export const logout = async () => {
  try { await request.post("/auth/logout", { refreshToken: localStorage.getItem("refreshToken") }); }
  finally { clearSession(); }
};
export const logoutAll = () => request.post("/auth/logout-all").then(unwrap);
export const getMe = () => request.get("/auth/me").then(unwrap);
export const updateMe = (payload) => request.patch("/auth/me", payload).then(unwrap);
export const changePassword = (payload) => request.patch("/auth/change-password", payload).then(unwrap);

export const getProducts = (params = {}) => request.get("/products", { params }).then(unwrap);
export const getProduct = (id) => request.get(`/products/${id}`).then(unwrap);
export const getCategories = (params = {}) => request.get("/categories", { params }).then(unwrap);
export const getCategory = (id) => request.get(`/categories/${id}`).then(unwrap);
export const getBrands = (params = {}) => request.get("/brands", { params }).then(unwrap);
export const getBrand = (id) => request.get(`/brands/${id}`).then(unwrap);
export const getBanners = (params = {}) => request.get("/banners", { params }).then(unwrap);
export const getVariants = (params = {}) => request.get("/variants", { params }).then(unwrap);
export const getVariant = (id) => request.get(`/variants/${id}`).then(unwrap);

export const getReviews = (productId, params = {}) => request.get(`/reviews/product/${productId}`, { params }).then(unwrap);
export const getReview = (id) => request.get(`/reviews/${id}`).then(unwrap);
export const createReview = (payload) => request.post("/reviews", payload).then(unwrap);
export const updateReview = (id, payload) => request.patch(`/reviews/${id}`, payload).then(unwrap);
export const deleteReview = (id) => request.delete(`/reviews/${id}`).then(unwrap);

const cartData = (response) => dataOf(unwrap(response));
export const getCart = () => request.get("/cart").then(cartData);
export const addCartItem = (payload) => request.post("/cart/items", payload).then(cartData);
export const updateCartItem = (itemId, quantity) => request.patch(`/cart/items/${itemId}`, { quantity }).then(cartData);
export const removeCartItem = (itemId) => request.delete(`/cart/items/${itemId}`).then(cartData);
export const clearCart = () => request.delete("/cart/clear").then(cartData);

export const getAddresses = () => request.get("/addresses").then(unwrap);
export const getAddress = (id) => request.get(`/addresses/${id}`).then(unwrap);
export const createAddress = (payload) => request.post("/addresses", payload).then(unwrap);
export const updateAddress = (id, payload) => request.patch(`/addresses/${id}`, payload).then(unwrap);
export const deleteAddress = (id) => request.delete(`/addresses/${id}`).then(unwrap);

export const createOrder = (payload) => request.post("/orders", payload).then(unwrap);
export const getOrders = (params = {}) => request.get("/orders", { params }).then(unwrap);
export const getOrder = (id) => request.get(`/orders/${id}`).then(unwrap);
export const updateOrder = (id, payload) => request.patch(`/orders/${id}`, payload).then(unwrap);
export const cancelOrder = (id) => request.patch(`/orders/${id}/cancel`).then(unwrap);

export const getWishlist = () => request.get("/wishlist").then(unwrap);
export const addWishlist = (product) => request.post("/wishlist/products", { product }).then(unwrap);
export const removeWishlist = (productId) => request.delete(`/wishlist/products/${productId}`).then(unwrap);
export const clearWishlist = () => request.delete("/wishlist").then(unwrap);

export const getNotifications = (params = {}) => request.get("/notifications", { params }).then(unwrap);
export const readNotification = (id) => request.patch(`/notifications/${id}/read`).then(unwrap);
export const readAllNotifications = () => request.post("/notifications/read-all").then(unwrap);
export const deleteNotification = (id) => request.delete(`/notifications/${id}`).then(unwrap);

export const validateCoupon = (code) => request.get(`/coupons/code/${encodeURIComponent(code)}`).then(unwrap);
export const createPayment = (payload) => request.post("/payments", payload).then(unwrap);

export { dataOf };

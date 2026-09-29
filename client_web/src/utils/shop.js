export const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value) || 0);

export const unwrapList = (result) => {
  const payload = result?.data ?? result;
  if (Array.isArray(payload)) return payload;

  // List endpoints return an array, while the wishlist endpoint returns a
  // document containing its populated products array.
  for (const key of ["products", "items", "results"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const imageOf = (item) =>
  item?.thumbnail || item?.images?.[0] || item?.variant?.thumbnail || process.env.REACT_APP_PRODUCT_PLACEHOLDER_URL || "";

export const attributesOf = (attributes) => {
  if (!attributes) return [];
  if (attributes instanceof Map) return Array.from(attributes.entries());
  return Object.entries(attributes);
};

export const cartTotal = (cart) =>
  (cart?.items || []).reduce((sum, item) => sum + Number(item.price || item.variant?.price || 0) * Number(item.quantity || 0), 0);

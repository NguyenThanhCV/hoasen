import request from "../utils/request";

export const getVariantsService = (params = {}) => {
  const { product, page = 1, limit = 20 } = params;

  const query = new URLSearchParams();

  if (product) {
    query.append("product", product);
  }

  query.append("page", page);
  query.append("limit", limit);

  return request(`/variants?${query.toString()}`, {
    method: "GET",
  });
};

export const getVariantDetailService = (variantId) => {
  return request(`/variants/${variantId}`, {
    method: "GET",
  });
};

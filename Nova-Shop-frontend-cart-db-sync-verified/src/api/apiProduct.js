import request from "../utils/request";

/**
 * GET PRODUCT LIST
 */
export const getProductsService = (params = {}) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    category,
    brand,
    status = "active",
    featured,
    sort,
  } = params;

  const query = new URLSearchParams();

  query.append("page", page);
  query.append("limit", limit);

  if (search) {
    query.append("search", search);
  }

  if (category) {
    query.append("category", category);
  }

  if (brand) {
    query.append("brand", brand);
  }

  if (status) {
    query.append("status", status);
  }

  if (featured !== undefined && featured !== "") {
    query.append("featured", featured);
  }

  if (sort) {
    query.append("sort", sort);
  }

  return request(`/products?${query.toString()}`, {
    method: "GET",
  });
};

/**
 * GET PRODUCT DETAIL
 */
export const getProductDetailService = (productId) => {
  return request(`/products/${productId}`, {
    method: "GET",
  });
};

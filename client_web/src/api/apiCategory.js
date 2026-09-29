import request from "../utils/request";

/**
 * GET /api/categories
 *
 * Ví dụ:
 * /categories
 * /categories?page=1&limit=20
 * /categories?status=active
 * /categories?parent=null
 */
export const getCategoriesService = (params = {}) => {
  const { page = 1, limit = 20, status = "active", parent } = params;

  const query = new URLSearchParams();

  query.append("page", page);
  query.append("limit", limit);

  if (status) {
    query.append("status", status);
  }

  if (parent !== undefined && parent !== "") {
    query.append("parent", parent);
  }

  return request(`/categories?${query.toString()}`, {
    method: "GET",
  });
};

/**
 * GET /api/categories/:categoryId
 */
export const getCategoryDetailService = (categoryId) => {
  return request(`/categories/${categoryId}`, {
    method: "GET",
  });
};

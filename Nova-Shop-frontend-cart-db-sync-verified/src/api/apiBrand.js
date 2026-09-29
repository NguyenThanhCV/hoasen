import request from "../utils/request";

export const getBrandsService = (params = {}) => {
  const { page = 1, limit = 20, status = "active" } = params;

  const query = new URLSearchParams();

  query.append("page", page);
  query.append("limit", limit);

  if (status) {
    query.append("status", status);
  }

  return request(`/brands?${query.toString()}`, {
    method: "GET",
  });
};

export const getBrandDetailService = (brandId) => {
  return request(`/brands/${brandId}`, {
    method: "GET",
  });
};

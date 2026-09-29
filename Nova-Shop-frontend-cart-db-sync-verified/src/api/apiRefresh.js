import request from "../utils/request";

const refreshService = (payload) => {
  return request.post("/auth/refresh", payload);
};

export { refreshService };

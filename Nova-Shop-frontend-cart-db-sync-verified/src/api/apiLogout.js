import request from "../utils/request";

const logoutService = (payload) => {
  return request.post("/auth/logout", payload);
};

export { logoutService };

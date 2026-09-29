import request from "../utils/request";

const meService = () => {
  return request.get("/auth/me");
};

export { meService };

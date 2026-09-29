import request from "../utils/request";

const loginService = (user) => {
  return request.post("/auth/login", user);
};

export { loginService };

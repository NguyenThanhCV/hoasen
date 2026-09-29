import request from "../utils/request";
const BASE_URL = "https://quanlycudan.azurewebsites.net/api";

export const getAllUserService = (params) => {
  return request(`${BASE_URL}/users/get-all/${params.url}`, {
    method: "POST",
    data: params,
  });
};
export const getProfileUserService = (params) => {
  return request(`${BASE_URL}/users/get-profile`, {
    method: "POST",
    data: params,
  });
};
export const deleteUserService = (username) => {
  return request(`${BASE_URL}/users/delete/${username}`, {
    method: "POST",
    data: username,
  });
};
export const deleteResidentService = (username) => {
  return request(`${BASE_URL}/users/delete/${username}`, {
    method: "POST",
    data: username,
  });
};
export async function updateDeptAmountService(params) {
  return request(`${BASE_URL}/users/update-dept-amount`, {
    method: "POST",
    requestType: "form",
    data: params,
  });
}
export const createUserService = (params) => {
  return request(`${BASE_URL}/users/create`, {
    method: "post",
    data: params,
  });
};
export const getRoleService = (params) => {
  return request(`${BASE_URL}/users/get-all-roles`, {
    method: "POST",
    data: params,
  });
};
export const getRoomService = (params) => {
  return request(`${BASE_URL}/room/get-all`, {
    method: "POST",
    data: params,
  });
};
export const editUserService = (params) => {
  return request(`${BASE_URL}/users/update`, {
    method: "POST",
    data: params,
  });
};
export const resetPWService = (username) => {
  return request(`${BASE_URL}/users/reset-password/${username}`, {
    method: "POST",
    data: username,
  });
};
export const changeStutusService = (username) => {
  return request(`${BASE_URL}/users/disable/${username}`, {
    method: "POST",
    data: username,
  });
};
export const createConfigService = (params) => {
  return request(`${BASE_URL}/Configuration/create`, {
    method: "POST",
    data: params,
  });
};
export const getConfigService = (params) => {
  return request(`${BASE_URL}/Configuration/get`, {
    method: "POST",
    data: params,
  });
};
export const getFeedbanksService = (params) => {
  return request(`${BASE_URL}/feedback/get-all`, {
    method: "POST",
    data: params,
  });
};
export const deleteFeedbacksService = (id) => {
  return request(`${BASE_URL}/feedback/delete/${id}`, {
    method: "POST",
    data: id,
  });
};
// aaaaaaaaaaaaaaaaaaaaaaaaaa
export const getDetailFeedbanksService = (id) => {
  return request(`${BASE_URL}/feedback/get-detail/${id}`, {
    method: "POST",
    data: id,
  });
};

export async function getReplyFeedbanksService(id, params) {
  return request(`${BASE_URL}/feedback/reply/${id}`, {
    method: "POST",
    requestType: "form",
    data: params,
  });
}
//
export async function createFeedbacksService(params) {
  return request(`${BASE_URL}/Feedback/create`, {
    method: "POST",
    requestType: "form",
    data: params,
  });
}
// get
export const getNewsResident = (params) => {
  return request(`${BASE_URL}/News/get-all`, {
    method: "POST",
    data: params,
  });
};

// get
export const getDetailNewsResident = (id) => {
  return request(`${BASE_URL}/News/get-detail/${id}`, {
    method: "POST",
    data: id,
  });
};
//
export async function ChangePWService(params) {
  return request(`${BASE_URL}/Users/change-password`, {
    method: "POST",
    data: params,
  });
}

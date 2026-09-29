import {
  SET_LOADING,
  SAVE_LOADING,
  GET_ALL_USER,
  SAVE_ALL_USER,
  UPDATE_DEPT_AMOUNT,
  DELETE_USER,
  GET_ALL_PROFILE,
  SAVE_ALL_PROFILE,
  RESET_PW,
  CHANGE_STATUS,
} from "./constants";
// loading
export function setLoading(payload) {
  return {
    type: SET_LOADING,
    payload,
  };
}

export function saveLoading(payload) {
  return {
    type: SAVE_LOADING,
    payload,
  };
}
// get
export function getAllUserRequestAction(payload) {
  return {
    type: GET_ALL_USER,
    payload,
  };
}
export function saveAllUserAction(payload) {
  return {
    type: SAVE_ALL_USER,
    payload,
  };
}
// get
export function getAllProfileAction(payload) {
  return {
    type: GET_ALL_PROFILE,
    payload,
  };
}
export function saveAllProfileAction(payload) {
  return {
    type: SAVE_ALL_PROFILE,
    payload,
  };
}
// delete
export const asyncDeleteUserAction = (dispatch) => (payload) => {
  return new Promise((resolve) => {
    dispatch({ type: DELETE_USER, payload, resolve });
  });
};
// update
export const asyncDetailUpdateStudentAction = (dispatch) => (payload) => {
  return new Promise((resolve) => {
    dispatch({ type: UPDATE_DEPT_AMOUNT, payload, resolve });
  });
};
// resetePW
export const asyncResetPWAction = (dispatch) => (payload) => {
  return new Promise((resolve) => {
    dispatch({ type: RESET_PW, payload, resolve });
  });
};
// changeStatus
export const asyncChangeStatusAction = (dispatch) => (payload) => {
  return new Promise((resolve) => {
    dispatch({ type: CHANGE_STATUS, payload, resolve });
  });
};

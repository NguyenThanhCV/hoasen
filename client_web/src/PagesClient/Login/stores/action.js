import { LOGIN_REQUEST } from "./constants";

export const asyncLoginRequestAction = (dispatch) => (payload) =>
  new Promise((resolve) => {
    dispatch({
      type: LOGIN_REQUEST,
      payload,
      resolve,
    });
  });

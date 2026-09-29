import { LOGOUT_REQUEST } from "./constants";

export const asyncLogoutAction = (dispatch) => (payload) =>
  new Promise((resolve) => {
    dispatch({
      type: LOGOUT_REQUEST,
      payload,
      resolve,
    });
  });

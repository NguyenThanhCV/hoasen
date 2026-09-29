import { REFRESH_REQUEST } from "./constants";

export const asyncRefreshAction = (dispatch) => (payload) =>
  new Promise((resolve) => {
    dispatch({
      type: REFRESH_REQUEST,
      payload,
      resolve,
    });
  });

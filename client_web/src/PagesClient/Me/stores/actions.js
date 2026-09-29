import { ME_REQUEST, SAVE_ME, SAVE_ME_LOADING, CLEAR_ME } from "./constants";

export const getMeAction = () => ({
  type: ME_REQUEST,
});

export const saveMeAction = (payload) => ({
  type: SAVE_ME,
  payload,
});

export const saveMeLoadingAction = (payload) => ({
  type: SAVE_ME_LOADING,
  payload,
});

export const clearMeAction = () => ({
  type: CLEAR_ME,
});

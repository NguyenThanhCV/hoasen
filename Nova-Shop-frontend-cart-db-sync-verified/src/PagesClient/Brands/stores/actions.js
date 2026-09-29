import {
  GET_BRANDS,
  SAVE_BRANDS,
  GET_BRAND_DETAIL,
  SAVE_BRAND_DETAIL,
  SET_LOADING,
  SET_DETAIL_LOADING,
  CLEAR_BRANDS,
  CLEAR_BRAND_DETAIL,
} from "./constants";

export const getBrandsRequestAction = (payload) => ({
  type: GET_BRANDS,
  payload,
});

export const saveBrandsAction = (payload) => ({
  type: SAVE_BRANDS,
  payload,
});

export const getBrandDetailRequestAction = (payload) => ({
  type: GET_BRAND_DETAIL,
  payload,
});

export const saveBrandDetailAction = (payload) => ({
  type: SAVE_BRAND_DETAIL,
  payload,
});

export const setBrandLoadingAction = (payload) => ({
  type: SET_LOADING,
  payload,
});

export const setBrandDetailLoadingAction = (payload) => ({
  type: SET_DETAIL_LOADING,
  payload,
});

export const clearBrandsAction = () => ({
  type: CLEAR_BRANDS,
});

export const clearBrandDetailAction = () => ({
  type: CLEAR_BRAND_DETAIL,
});

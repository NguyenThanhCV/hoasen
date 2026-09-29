import {
  GET_PRODUCT_DETAIL,
  SAVE_PRODUCT_DETAIL,
  GET_PRODUCT_VARIANTS,
  SAVE_PRODUCT_VARIANTS,
  SET_LOADING,
  SET_VARIANT_LOADING,
  SET_SELECTED_VARIANT,
  CLEAR_PRODUCT_DETAIL,
} from "./constants";

export const getProductDetailRequestAction = (productId) => ({
  type: GET_PRODUCT_DETAIL,
  payload: productId,
});

export const saveProductDetailAction = (payload) => ({
  type: SAVE_PRODUCT_DETAIL,
  payload,
});

export const getProductVariantsRequestAction = (productId) => ({
  type: GET_PRODUCT_VARIANTS,
  payload: productId,
});

export const saveProductVariantsAction = (payload) => ({
  type: SAVE_PRODUCT_VARIANTS,
  payload,
});

export const setProductDetailLoadingAction = (payload) => ({
  type: SET_LOADING,
  payload,
});

export const setProductVariantLoadingAction = (payload) => ({
  type: SET_VARIANT_LOADING,
  payload,
});

export const setSelectedVariantAction = (payload) => ({
  type: SET_SELECTED_VARIANT,
  payload,
});

export const clearProductDetailAction = () => ({
  type: CLEAR_PRODUCT_DETAIL,
});

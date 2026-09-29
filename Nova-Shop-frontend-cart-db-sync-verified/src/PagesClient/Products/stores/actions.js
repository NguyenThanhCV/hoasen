import {
  GET_PRODUCTS,
  SAVE_PRODUCTS,
  SET_LOADING,
  CLEAR_PRODUCTS,
} from "./constants";

/*
=====================================================
GET PRODUCTS
=====================================================
*/

export const getProductsRequestAction = (payload) => {
  return {
    type: GET_PRODUCTS,
    payload,
  };
};

/*
=====================================================
SAVE PRODUCTS
=====================================================
*/

export const saveProductsAction = (payload) => {
  return {
    type: SAVE_PRODUCTS,
    payload,
  };
};

/*
=====================================================
LOADING
=====================================================
*/

export const setProductLoadingAction = (payload) => {
  return {
    type: SET_LOADING,
    payload,
  };
};

/*
=====================================================
CLEAR
=====================================================
*/

export const clearProductsAction = () => {
  return {
    type: CLEAR_PRODUCTS,
  };
};

import {
  GET_CATEGORIES,
  SAVE_CATEGORIES,
  GET_CATEGORY_DETAIL,
  SAVE_CATEGORY_DETAIL,
  SET_LOADING,
  SET_DETAIL_LOADING,
  CLEAR_CATEGORIES,
  CLEAR_CATEGORY_DETAIL,
} from "./constants";

/**
 * GET CATEGORIES
 */
export const getCategoriesRequestAction = (payload) => {
  return {
    type: GET_CATEGORIES,
    payload,
  };
};

/**
 * SAVE CATEGORIES
 */
export const saveCategoriesAction = (payload) => {
  return {
    type: SAVE_CATEGORIES,
    payload,
  };
};

/**
 * GET CATEGORY DETAIL
 */
export const getCategoryDetailRequestAction = (payload) => {
  return {
    type: GET_CATEGORY_DETAIL,
    payload,
  };
};

/**
 * SAVE CATEGORY DETAIL
 */
export const saveCategoryDetailAction = (payload) => {
  return {
    type: SAVE_CATEGORY_DETAIL,
    payload,
  };
};

/**
 * LOADING LIST
 */
export const setCategoryLoadingAction = (payload) => {
  return {
    type: SET_LOADING,
    payload,
  };
};

/**
 * LOADING DETAIL
 */
export const setCategoryDetailLoadingAction = (payload) => {
  return {
    type: SET_DETAIL_LOADING,
    payload,
  };
};

/**
 * CLEAR LIST
 */
export const clearCategoriesAction = () => {
  return {
    type: CLEAR_CATEGORIES,
  };
};

/**
 * CLEAR DETAIL
 */
export const clearCategoryDetailAction = () => {
  return {
    type: CLEAR_CATEGORY_DETAIL,
  };
};

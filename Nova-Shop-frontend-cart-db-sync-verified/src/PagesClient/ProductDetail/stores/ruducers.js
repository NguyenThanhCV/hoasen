import INIT_STATE_PRODUCT_DETAIL from "./states";

import {
  SAVE_PRODUCT_DETAIL,
  SAVE_PRODUCT_VARIANTS,
  SET_LOADING,
  SET_VARIANT_LOADING,
  SET_SELECTED_VARIANT,
  CLEAR_PRODUCT_DETAIL,
} from "./constants";

const productDetailReducers = (state = INIT_STATE_PRODUCT_DETAIL, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case SAVE_PRODUCT_DETAIL:
      return {
        ...state,
        productDetail: action.payload,
      };

    case SET_VARIANT_LOADING:
      return {
        ...state,
        isVariantLoading: action.payload,
      };

    case SAVE_PRODUCT_VARIANTS:
      return {
        ...state,
        variants: action.payload?.variants || [],
        variantPagination: action.payload?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      };

    case SET_SELECTED_VARIANT:
      return {
        ...state,
        selectedVariant: action.payload,
      };

    case CLEAR_PRODUCT_DETAIL:
      return INIT_STATE_PRODUCT_DETAIL;

    default:
      return state;
  }
};

export default productDetailReducers;

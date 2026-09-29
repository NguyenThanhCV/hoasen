import produce from "immer";

import { INIT_STATE_PRODUCT } from "./states";

import { SAVE_PRODUCTS, SET_LOADING, CLEAR_PRODUCTS } from "./constants";

export default function productReducers(state = INIT_STATE_PRODUCT, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      /*
        =============================================
        SAVE PRODUCTS
        =============================================
        */

      case SAVE_PRODUCTS:
        draft.dataProduct = action.payload?.data || [];

        draft.pagination = action.payload?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        };

        break;

      /*
        =============================================
        LOADING
        =============================================
        */

      case SET_LOADING:
        draft.isLoading = action.payload;

        break;

      /*
        =============================================
        CLEAR
        =============================================
        */

      case CLEAR_PRODUCTS:
        draft.dataProduct = [];

        draft.pagination = {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        };

        break;

      default:
        return state;
    }
  });
}

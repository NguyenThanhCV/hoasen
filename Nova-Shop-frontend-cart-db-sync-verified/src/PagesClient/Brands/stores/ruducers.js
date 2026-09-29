import { produce } from "immer";

import {
  SAVE_BRANDS,
  SAVE_BRAND_DETAIL,
  SET_LOADING,
  SET_DETAIL_LOADING,
  CLEAR_BRANDS,
  CLEAR_BRAND_DETAIL,
} from "./constants";

import { INIT_STATE_BRAND } from "./states";

const brandReducers = (state = INIT_STATE_BRAND, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case SAVE_BRANDS: {
        draft.dataBrand = action.payload?.data || [];

        draft.pagination = action.payload?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        };

        break;
      }

      case SAVE_BRAND_DETAIL: {
        draft.brandDetail = action.payload || null;

        break;
      }

      case SET_LOADING: {
        draft.isLoading = action.payload;

        break;
      }

      case SET_DETAIL_LOADING: {
        draft.isDetailLoading = action.payload;

        break;
      }

      case CLEAR_BRANDS: {
        draft.dataBrand = [];

        draft.pagination = {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        };

        break;
      }

      case CLEAR_BRAND_DETAIL: {
        draft.brandDetail = null;

        break;
      }

      default:
        break;
    }
  });

export default brandReducers;

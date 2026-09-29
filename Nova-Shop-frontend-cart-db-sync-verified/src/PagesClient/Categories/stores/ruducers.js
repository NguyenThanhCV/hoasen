import produce from "immer";

import { INIT_STATE_CATEGORY } from "./states";

import {
  SAVE_CATEGORIES,
  SAVE_CATEGORY_DETAIL,
  SET_LOADING,
  SET_DETAIL_LOADING,
  CLEAR_CATEGORIES,
  CLEAR_CATEGORY_DETAIL,
} from "./constants";

export default function categoryReducers(state = INIT_STATE_CATEGORY, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      /**
       * SAVE CATEGORY LIST
       */
      case SAVE_CATEGORIES:
        draft.dataCategory = action.payload?.data || [];

        draft.pagination = action.payload?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        };

        break;

      /**
       * SAVE CATEGORY DETAIL
       */
      case SAVE_CATEGORY_DETAIL:
        draft.categoryDetail = action.payload || null;

        break;

      /**
       * LIST LOADING
       */
      case SET_LOADING:
        draft.isLoading = action.payload;

        break;

      /**
       * DETAIL LOADING
       */
      case SET_DETAIL_LOADING:
        draft.isDetailLoading = action.payload;

        break;

      /**
       * CLEAR LIST
       */
      case CLEAR_CATEGORIES:
        draft.dataCategory = [];

        draft.pagination = {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        };

        break;

      /**
       * CLEAR DETAIL
       */
      case CLEAR_CATEGORY_DETAIL:
        draft.categoryDetail = null;

        break;

      default:
        return state;
    }
  });
}

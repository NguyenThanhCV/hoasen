import { createSelector } from "reselect";

import { INIT_STATE_CATEGORY } from "./states";

/**
 * ROOT CATEGORY STATE
 */
const selectCategory = (state) => {
  return state.categoryReducers || INIT_STATE_CATEGORY;
};

/**
 * LIST LOADING
 */
const selectCategoryLoading = createSelector(
  selectCategory,
  (state) => state.isLoading,
);

/**
 * CATEGORY LIST
 */
const selectCategories = createSelector(
  selectCategory,
  (state) => state.dataCategory || [],
);

/**
 * PAGINATION
 */
const selectCategoryPagination = createSelector(
  selectCategory,
  (state) =>
    state.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
);

/**
 * DETAIL
 */
const selectCategoryDetail = createSelector(
  selectCategory,
  (state) => state.categoryDetail,
);

/**
 * DETAIL LOADING
 */
const selectCategoryDetailLoading = createSelector(
  selectCategory,
  (state) => state.isDetailLoading,
);

export {
  selectCategoryLoading,
  selectCategories,
  selectCategoryPagination,
  selectCategoryDetail,
  selectCategoryDetailLoading,
};

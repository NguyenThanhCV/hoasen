import { createSelector } from "reselect";

import { INIT_STATE_PRODUCT } from "./states";

/*
=====================================================
ROOT
=====================================================
*/

const selectProduct = (state) => state.productReducers || INIT_STATE_PRODUCT;

/*
=====================================================
LOADING
=====================================================
*/

const selectProductLoading = createSelector(
  selectProduct,
  (state) => state.isLoading,
);

/*
=====================================================
PRODUCTS
=====================================================
*/

const selectProducts = createSelector(
  selectProduct,
  (state) => state.dataProduct || [],
);

/*
=====================================================
PAGINATION
=====================================================
*/

const selectProductPagination = createSelector(
  selectProduct,
  (state) =>
    state.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
);

export { selectProductLoading, selectProducts, selectProductPagination };

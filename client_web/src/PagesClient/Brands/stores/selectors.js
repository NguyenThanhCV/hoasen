import { createSelector } from "reselect";

const selectBrandState = (state) => state.brandReducers;

export const selectBrandLoading = createSelector(
  [selectBrandState],
  (state) => state?.isLoading || false,
);

export const selectBrands = createSelector(
  [selectBrandState],
  (state) => state?.dataBrand || [],
);

export const selectBrandPagination = createSelector(
  [selectBrandState],
  (state) =>
    state?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
);

export const selectBrandDetail = createSelector(
  [selectBrandState],
  (state) => state?.brandDetail || null,
);

export const selectBrandDetailLoading = createSelector(
  [selectBrandState],
  (state) => state?.isDetailLoading || false,
);

import { createSelector } from "reselect";

const selectProductDetailState = (state) => state.productDetailReducers;

export const selectProductDetailLoading = createSelector(
  [selectProductDetailState],
  (state) => state?.isLoading || false,
);

export const selectProductDetail = createSelector(
  [selectProductDetailState],
  (state) => state?.productDetail || null,
);

export const selectProductVariants = createSelector(
  [selectProductDetailState],
  (state) => state?.variants || [],
);

export const selectProductVariantLoading = createSelector(
  [selectProductDetailState],
  (state) => state?.isVariantLoading || false,
);

export const selectSelectedVariant = createSelector(
  [selectProductDetailState],
  (state) => state?.selectedVariant || null,
);

export const selectVariantPagination = createSelector(
  [selectProductDetailState],
  (state) =>
    state?.variantPagination || {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },
);

const INIT_STATE_PRODUCT_DETAIL = {
  isLoading: false,

  productDetail: null,

  variants: [],
  variantPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  isVariantLoading: false,

  selectedVariant: null,
};

export default INIT_STATE_PRODUCT_DETAIL;

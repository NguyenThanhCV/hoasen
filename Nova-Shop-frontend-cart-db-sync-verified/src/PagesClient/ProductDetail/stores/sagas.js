import { takeLatest, call, put } from "redux-saga/effects";

import { GET_PRODUCT_DETAIL, GET_PRODUCT_VARIANTS } from "./constants";

import {
  saveProductDetailAction,
  saveProductVariantsAction,
  setProductDetailLoadingAction,
  setProductVariantLoadingAction,
  setSelectedVariantAction,
} from "./actions";

import { getProductDetailService } from "../../../api/apiProduct";

import { getVariantsService } from "../../../api/apiVariant";

/*
=====================================================
GET PRODUCT DETAIL SAGA
=====================================================
*/

function* getProductDetailSaga({ payload }) {
  try {
    yield put(setProductDetailLoadingAction(true));

    console.log("PRODUCT DETAIL REQUEST:", payload);

    /*
    ================================================
    API:

    GET /api/products/:productId
    ================================================
    */

    const response = yield call(getProductDetailService, payload);

    console.log("PRODUCT DETAIL API RESPONSE:", response);

    const result = response?.data;

    /*
    ================================================
    API RESPONSE:

    {
      success: true,
      data: []
    }

    hoặc:

    {
      success: true,
      data: {}
    }
    ================================================
    */

    if (!result?.success) {
      yield put(saveProductDetailAction(null));

      return;
    }

    let product = null;

    if (Array.isArray(result.data)) {
      product = result.data[0] || null;
    } else {
      product = result.data || null;
    }

    yield put(saveProductDetailAction(product));
  } catch (error) {
    console.error("GET PRODUCT DETAIL ERROR:", error);

    yield put(saveProductDetailAction(null));
  } finally {
    yield put(setProductDetailLoadingAction(false));
  }
}

/*
=====================================================
GET PRODUCT VARIANTS SAGA
=====================================================
*/

function* getProductVariantsSaga({ payload }) {
  try {
    yield put(setProductVariantLoadingAction(true));

    console.log("PRODUCT VARIANTS REQUEST:", payload);

    /*
    ================================================
    API:

    GET /api/variants
    ?product=PRODUCT_ID
    &page=1
    &limit=20
    ================================================
    */

    const response = yield call(getVariantsService, {
      product: payload,
      page: 1,
      limit: 20,
    });

    console.log("PRODUCT VARIANTS API RESPONSE:", response);

    const result = response?.data;

    /*
    ================================================
    API RESPONSE:

    {
      success: true,
      data: [],
      pagination: {}
    }
    ================================================
    */

    if (!result?.success) {
      yield put(
        saveProductVariantsAction({
          variants: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        }),
      );

      return;
    }

    const variants = Array.isArray(result.data) ? result.data : [];

    const pagination = result.pagination || {
      page: 1,
      limit: 20,
      total: variants.length,
      pages: variants.length > 0 ? 1 : 0,
    };

    yield put(
      saveProductVariantsAction({
        variants,
        pagination,
      }),
    );

    /*
    ================================================
    NẾU CHỈ CÓ 1 VARIANT

    Tự động chọn variant đó
    ================================================
    */

    if (variants.length === 1) {
      yield put(setSelectedVariantAction(variants[0]));
    }
  } catch (error) {
    console.error("GET PRODUCT VARIANTS ERROR:", error);

    yield put(
      saveProductVariantsAction({
        variants: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      }),
    );
  } finally {
    yield put(setProductVariantLoadingAction(false));
  }
}

/*
=====================================================
PRODUCT DETAIL SAGA
=====================================================
*/

export function* productDetailSaga() {
  yield takeLatest(GET_PRODUCT_DETAIL, getProductDetailSaga);

  yield takeLatest(GET_PRODUCT_VARIANTS, getProductVariantsSaga);
}

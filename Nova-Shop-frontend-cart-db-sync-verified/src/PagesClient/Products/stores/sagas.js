import { takeLatest, call, put } from "redux-saga/effects";

import { GET_PRODUCTS } from "./constants";

import { saveProductsAction, setProductLoadingAction } from "./actions";

import { getProductsService } from "../../../api/apiProduct";

/*
=====================================================
GET PRODUCTS SAGA
=====================================================
*/

function* getProductsSaga({ payload }) {
  try {
    yield put(setProductLoadingAction(true));

    console.log("PRODUCT REQUEST:", payload);

    const response = yield call(getProductsService, payload);

    console.log("PRODUCT API RESPONSE:", response);

    const result = response?.data;

    /*
    ================================================
    API:

    {
      success: true,
      data: [],
      pagination: {}
    }
    ================================================
    */

    if (!result?.success) {
      yield put(
        saveProductsAction({
          data: [],
          pagination: {
            page: payload?.page || 1,

            limit: payload?.limit || 20,

            total: 0,

            pages: 0,
          },
        }),
      );

      return;
    }

    yield put(
      saveProductsAction({
        data: result.data || [],

        pagination: result.pagination || {
          page: payload?.page || 1,

          limit: payload?.limit || 20,

          total: 0,

          pages: 0,
        },
      }),
    );
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    yield put(
      saveProductsAction({
        data: [],

        pagination: {
          page: payload?.page || 1,

          limit: payload?.limit || 20,

          total: 0,

          pages: 0,
        },
      }),
    );
  } finally {
    yield put(setProductLoadingAction(false));
  }
}

/*
=====================================================
PRODUCT SAGA
=====================================================
*/

export function* productSaga() {
  yield takeLatest(GET_PRODUCTS, getProductsSaga);
}

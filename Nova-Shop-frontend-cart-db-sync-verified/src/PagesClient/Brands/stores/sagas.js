import { call, put, takeLatest } from "redux-saga/effects";

import { getBrandsService, getBrandDetailService } from "../../../api/apiBrand";

import { GET_BRANDS, GET_BRAND_DETAIL } from "./constants";

import {
  saveBrandsAction,
  saveBrandDetailAction,
  setBrandLoadingAction,
  setBrandDetailLoadingAction,
} from "./actions";

function* getBrandsSaga(action) {
  try {
    yield put(setBrandLoadingAction(true));

    const response = yield call(getBrandsService, action.payload || {});

    const result = response?.data;

    if (result?.success) {
      yield put(
        saveBrandsAction({
          data: result.data || [],
          pagination: result.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        }),
      );
    } else {
      yield put(
        saveBrandsAction({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        }),
      );
    }
  } catch (error) {
    console.error("getBrandsSaga error:", error);

    yield put(
      saveBrandsAction({
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      }),
    );
  } finally {
    yield put(setBrandLoadingAction(false));
  }
}

function* getBrandDetailSaga(action) {
  try {
    yield put(setBrandDetailLoadingAction(true));

    const response = yield call(getBrandDetailService, action.payload);

    const result = response?.data;

    if (result?.success) {
      yield put(saveBrandDetailAction(result.data || null));
    } else {
      yield put(saveBrandDetailAction(null));
    }
  } catch (error) {
    console.error("getBrandDetailSaga error:", error);

    yield put(saveBrandDetailAction(null));
  } finally {
    yield put(setBrandDetailLoadingAction(false));
  }
}

export function* brandSaga() {
  yield takeLatest(GET_BRANDS, getBrandsSaga);

  yield takeLatest(GET_BRAND_DETAIL, getBrandDetailSaga);
}

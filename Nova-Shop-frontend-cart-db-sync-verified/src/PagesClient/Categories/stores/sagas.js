import { takeLatest, call, put } from "redux-saga/effects";

import { GET_CATEGORIES, GET_CATEGORY_DETAIL } from "./constants";

import {
  saveCategoriesAction,
  saveCategoryDetailAction,
  setCategoryLoadingAction,
  setCategoryDetailLoadingAction,
} from "./actions";

import {
  getCategoriesService,
  getCategoryDetailService,
} from "../../../api/apiCategory";

/**
 * =====================================================
 * GET CATEGORY LIST
 * =====================================================
 */
function* getCategoriesSaga({ payload }) {
  try {
    yield put(setCategoryLoadingAction(true));

    console.log("CATEGORY REQUEST:", payload);

    const response = yield call(getCategoriesService, payload);

    console.log("CATEGORY API RESPONSE:", response);

    const result = response?.data;

    if (!result?.success) {
      yield put(
        saveCategoriesAction({
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
      saveCategoriesAction({
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
    console.error("GET CATEGORIES ERROR:", error);

    yield put(
      saveCategoriesAction({
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
    yield put(setCategoryLoadingAction(false));
  }
}

/**
 * =====================================================
 * GET CATEGORY DETAIL
 * =====================================================
 */
function* getCategoryDetailSaga({ payload }) {
  try {
    yield put(setCategoryDetailLoadingAction(true));

    console.log("CATEGORY DETAIL REQUEST:", payload);

    const response = yield call(getCategoryDetailService, payload);

    console.log("CATEGORY DETAIL API RESPONSE:", response);

    const result = response?.data;

    if (!result?.success) {
      yield put(saveCategoryDetailAction(null));

      return;
    }

    /**
     * DETAIL API trả:
     *
     * {
     *   success: true,
     *   data: {...}
     * }
     *
     * Khác Product Detail:
     * Product Detail trả data là array.
     */
    yield put(saveCategoryDetailAction(result.data || null));
  } catch (error) {
    console.error("GET CATEGORY DETAIL ERROR:", error);

    yield put(saveCategoryDetailAction(null));
  } finally {
    yield put(setCategoryDetailLoadingAction(false));
  }
}

/**
 * =====================================================
 * CATEGORY SAGA
 * =====================================================
 */
export function* categorySaga() {
  yield takeLatest(GET_CATEGORIES, getCategoriesSaga);

  yield takeLatest(GET_CATEGORY_DETAIL, getCategoryDetailSaga);
}

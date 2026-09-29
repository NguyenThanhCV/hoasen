import { takeLatest, call, put } from "redux-saga/effects";

import { ME_REQUEST } from "./constants";

import { saveMeAction, saveMeLoadingAction, clearMeAction } from "./actions";

import { meService } from "../../../api/apiMe";

function* meRequestSaga() {
  try {
    yield put(saveMeLoadingAction(true));

    const response = yield call(meService);

    console.log("ME API RESPONSE:", response);

    const result = response.data;

    if (!result?.success) {
      yield put(clearMeAction());
      return;
    }

    const user = result?.data;

    yield put(saveMeAction(user));
  } catch (error) {
    console.error("ME SAGA ERROR:", error);

    yield put(clearMeAction());
  } finally {
    yield put(saveMeLoadingAction(false));
  }
}

export function* meSaga() {
  yield takeLatest(ME_REQUEST, meRequestSaga);
}

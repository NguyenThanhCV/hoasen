import { takeLatest, call } from "redux-saga/effects";

import { REFRESH_REQUEST } from "./constants";
import { refreshService } from "../../../api/apiRefresh";

function* refreshRequestSaga({ payload, resolve }) {
  try {
    const response = yield call(refreshService, payload);

    console.log("REFRESH API RESPONSE:", response);

    const result = response.data;

    if (!result?.success) {
      resolve(result);
      return;
    }

    const accessToken = result?.data?.accessToken;

    const refreshToken = result?.data?.refreshToken;

    if (accessToken) {
      localStorage.setItem("token", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    resolve(result);
  } catch (error) {
    console.error("REFRESH SAGA ERROR:", error);

    resolve(null);
  }
}

export function* refreshSaga() {
  yield takeLatest(REFRESH_REQUEST, refreshRequestSaga);
}

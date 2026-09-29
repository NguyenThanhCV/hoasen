import { takeLatest, call } from "redux-saga/effects";

import { LOGOUT_REQUEST } from "./constants";
import { logoutService } from "../../../api/apiLogout";

function* logoutRequestSaga({ payload, resolve }) {
  try {
    const response = yield call(logoutService, payload);

    console.log("LOGOUT API RESPONSE:", response);

    const result = response.data;

    if (!result?.success) {
      resolve(result);
      return;
    }

    // Xóa thông tin đăng nhập local
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Thông báo cho Header / các component khác
    window.dispatchEvent(new Event("auth-change"));

    resolve(result);
  } catch (error) {
    console.error("LOGOUT SAGA ERROR:", error);

    resolve(null);
  }
}

export function* logoutSaga() {
  yield takeLatest(LOGOUT_REQUEST, logoutRequestSaga);
}

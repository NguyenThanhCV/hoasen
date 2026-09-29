import { takeLatest, call } from "redux-saga/effects";
import { LOGIN_REQUEST } from "./constants";
import { loginService } from "../../../api/apiLogin";

function* loginRequestSaga({ payload, resolve }) {
  try {
    const response = yield call(loginService, payload);

    const result = response.data;

    if (!result?.success) {
      resolve(result);
      return;
    }

    const user = result?.data?.user;
    const accessToken = result?.data?.accessToken;
    const refreshToken = result?.data?.refreshToken;


    // ==============================
    // LƯU ACCESS TOKEN
    // ==============================

    if (accessToken) {
      localStorage.setItem("token", accessToken);
    }

    // ==============================
    // LƯU REFRESH TOKEN
    // ==============================

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // ==============================
    // LƯU USER
    // ==============================

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    // ==============================
    // KIỂM TRA SAU KHI LƯU
    // ==============================

    // ==============================
    // BÁO CHO HEADER
    // ==============================

    window.dispatchEvent(new Event("auth-change"));

    resolve(result);
  } catch (error) {
    console.error("LOGIN SAGA ERROR:", error);

    resolve(null);
  }
}

export function* sagaNew() {
  yield takeLatest(LOGIN_REQUEST, loginRequestSaga);
}

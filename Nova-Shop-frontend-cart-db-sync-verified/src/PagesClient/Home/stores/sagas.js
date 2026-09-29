import { takeLatest, call, put } from "redux-saga/effects";
import { changeStutusService } from "../../../../api/apiUser";
import {
  saveLoading,
  saveAllUserAction,
  saveAllProfileAction,
} from "./actions";
import {
  GET_ALL_USER,
  DELETE_USER,
  UPDATE_DEPT_AMOUNT,
  GET_ALL_PROFILE,
  RESET_PW,
  CHANGE_STATUS,
} from "./constants";
import {
  resetPWService,
  getAllUserService,
  deleteUserService,
  updateDeptAmountService,
  getProfileUserService,
} from "../../../../api/apiUser";
// // loading
// function* setLoadingsage({ payload }) {
//   try {
//     yield put(saveLoading(payload));
//   } catch (error) {
//     console.log(error);
//   }
// }
// get
function* getAllUsersaga({ payload }) {
  try {
    yield put(saveLoading(true));
    const response = yield call(getAllUserService, payload);

    yield put(saveAllUserAction(response.data.result));
    yield put(saveLoading(false));
  } catch (error) {
    console.log(error);
  }
}
// get
function* getAllProfilesaga({ payload }) {
  try {
    const response = yield call(getProfileUserService, payload);
    yield put(saveAllProfileAction(response.data.result));
  } catch (error) {
    console.log(error);
  }
}
// delete
function* deleteUserSaga({ payload, resolve }) {
  try {
    const res = yield call(deleteUserService, payload);
    resolve(res.status);
  } catch (error) {
    console.log(error);
  }
}
// update-dept-amount
function* updateDeptAmountSaga({ payload, resolve }) {
  try {
    const res = yield call(updateDeptAmountService, payload);
    resolve(res);
  } catch (error) {
    console.log(error.message);
  }
}
// resetPW
function* resetPWSaga({ payload, resolve }) {
  try {
    const res = yield call(resetPWService, payload);
    resolve(res.status);
  } catch (error) {
    console.log(error.message);
  }
}
// changeStatus
function* changeStatusSaga({ payload, resolve }) {
  try {
    const res = yield call(changeStutusService, payload);
    resolve(res.status);
  } catch (error) {
    console.log(error.message);
  }
}
export function* allUserAccount() {
  yield takeLatest(GET_ALL_USER, getAllUsersaga);
  yield takeLatest(DELETE_USER, deleteUserSaga);
  yield takeLatest(UPDATE_DEPT_AMOUNT, updateDeptAmountSaga);
  yield takeLatest(GET_ALL_PROFILE, getAllProfilesaga);
  yield takeLatest(RESET_PW, resetPWSaga);
  yield takeLatest(CHANGE_STATUS, changeStatusSaga);
}

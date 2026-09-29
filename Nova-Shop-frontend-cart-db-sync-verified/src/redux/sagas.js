import { all } from "redux-saga/effects";

import { sagaNew as loginSaga } from "../PagesClient/Login/stores/sagas";

import { meSaga } from "../PagesClient/Me/stores/sagas";
import { refreshSaga } from "../PagesClient/Refresh/stores/sagas";
import { logoutSaga } from "../PagesClient/Logout/stores/sagas";
import { productSaga } from "../PagesClient/Products/stores/sagas";
import { categorySaga } from "../PagesClient/Categories/stores/sagas";
import { brandSaga } from "../PagesClient/Brands/stores/sagas";
import { productDetailSaga } from "../PagesClient/ProductDetail/stores/sagas";
export default function* rootSaga() {
  yield all([
    loginSaga(),
    meSaga(),
    refreshSaga(),
    logoutSaga(),
    productSaga(),
    categorySaga(),
    brandSaga(),
    productDetailSaga(),
  ]);
}

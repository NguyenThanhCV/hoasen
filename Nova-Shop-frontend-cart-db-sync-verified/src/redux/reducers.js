import { combineReducers } from "redux";

import meReducers from "../PagesClient/Me/stores/ruducers";
import productReducers from "../PagesClient/Products/stores/ruducers";
import categoryReducers from "../PagesClient/Categories/stores/ruducers";
import brandReducers from "../PagesClient/Brands/stores/ruducers";
import productDetailReducers from "../PagesClient/ProductDetail/stores/ruducers";

export default function createReducer() {
  const rootReducer = combineReducers({
    meReducers,
    productReducers,
    categoryReducers,
    brandReducers,
    productDetailReducers,
  });

  return rootReducer;
}

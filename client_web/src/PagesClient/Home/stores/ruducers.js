import { INIT_STATE_ACCOUNT_USER } from "./states";
import produce from "immer";

import { SAVE_LOADING, SAVE_ALL_USER, SAVE_ALL_PROFILE } from "./constants";

export default function accountUserReducers(
  state = INIT_STATE_ACCOUNT_USER,
  action
) {
  return produce(state, (draft) => {
    switch (action.type) {
      case SAVE_LOADING:
        draft.isLoading = action.payload;
        break;
      case SAVE_ALL_USER:
        draft.dataUser = action.payload;
        break;
      case SAVE_ALL_PROFILE:
        draft.dataProfile = action.payload;
        break;
      default:
        return state;
    }
  });
}

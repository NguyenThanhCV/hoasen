import produce from "immer";
import { INIT_STATE_ME } from "./states";

import { SAVE_ME, SAVE_ME_LOADING, CLEAR_ME } from "./constants";

export default function meReducers(state = INIT_STATE_ME, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case SAVE_ME:
        draft.data = action.payload;
        break;

      case SAVE_ME_LOADING:
        draft.isLoading = action.payload;
        break;

      case CLEAR_ME:
        draft.data = null;
        break;

      default:
        return state;
    }
  });
}

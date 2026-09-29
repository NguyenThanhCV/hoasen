import { createSelector } from "reselect";
import { INIT_STATE_ACCOUNT_USER } from "./states";

const selectUser = (state) =>
  state.accountUserReducers || INIT_STATE_ACCOUNT_USER;

const selectLoading = createSelector(selectUser, (state) => state.isLoading);
const selectDataUser = createSelector(
  selectUser,
  (state) => state.dataUser || []
);

const selectUserProfile = createSelector(
  selectUser,
  (state) => state.dataProfile
);
export {
  selectLoading,
  selectDataUser,
  selectUserProfile,
  // selectDataRole,
  // selectDataRoom,
};

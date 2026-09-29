import { createSelector } from "reselect";
import { INIT_STATE_ME } from "./states";

const selectMe = (state) => state.meReducers || INIT_STATE_ME;

const selectMeData = createSelector(selectMe, (state) => state.data);

const selectMeLoading = createSelector(selectMe, (state) => state.isLoading);

export { selectMeData, selectMeLoading };

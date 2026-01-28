import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMe } from "../helpers/endpoints";

export const fetchSession = createAsyncThunk(
  "session/fetch",
  async () => (await getMe()).data
);

const slice = createSlice({
  name: "session",
  initialState: {
    token: localStorage.getItem("token"),
    user: null,
    stage: null,
    onboardingCompleted: false,
  },
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    logout(state) {
      state.token = null;
      localStorage.removeItem("token");
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
      state.stage = null;
      state.onboardingCompleted = false;
      localStorage.removeItem("token");
    }
  },
  extraReducers: (b) => {
    b.addCase(fetchSession.fulfilled, (s, a) => {
      s.user = a.payload;
      s.stage = a.payload.stage;
      s.onboardingCompleted = a.payload.onboardingCompleted;
    });
  },
});

export const { setToken, logout, clearSession } = slice.actions;
export default slice.reducer;
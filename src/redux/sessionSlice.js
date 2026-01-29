import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMe } from "../helpers/endpoints";

export const fetchSession = createAsyncThunk(
  "session/fetch",
  async () => (await getMe()).data
);

const slice = createSlice({
  name: "session",
  initialState: {
    token: (() => {
      const token = localStorage.getItem("token");
      console.log("sessionSlice: Initial token from localStorage:", !!token);
      return token;
    })(),
    user: null,
    stage: null,
    onboardingCompleted: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    setToken(state, action) {
      console.log("sessionSlice: setToken called with:", !!action.payload);
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
        console.log("sessionSlice: Token saved to localStorage");
      } else {
        localStorage.removeItem("token");
        console.log("sessionSlice: Token removed from localStorage");
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.stage = null;
      state.onboardingCompleted = false;
      localStorage.removeItem("token");
      console.log("sessionSlice: User logged out, token removed");
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
      state.stage = null;
      state.onboardingCompleted = false;
      state.error = null;
      localStorage.removeItem("token");
      console.log("sessionSlice: Session cleared, token removed");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log("sessionSlice: fetchSession started");
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.stage = action.payload.stage;
        state.onboardingCompleted = action.payload.onboardingCompleted;
        state.error = null;
        console.log("sessionSlice: fetchSession successful");
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        // Don't clear the token on fetch failure - token might still be valid
        console.log("sessionSlice: fetchSession failed, but keeping token:", action.error.message);
      });
  },
});

export const { setToken, logout, clearSession } = slice.actions;
export default slice.reducer;
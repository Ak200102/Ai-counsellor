import { configureStore } from "@reduxjs/toolkit";
import session from "./sessionSlice";

export const store = configureStore({
  reducer: { session },
});
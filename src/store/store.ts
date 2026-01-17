import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import blogReducer from "./blogSlice"
import commentReducer from "./commentSlice"

export const store = configureStore({
  reducer: { authReducer, blogReducer, commentReducer },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

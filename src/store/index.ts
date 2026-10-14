import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import locationsReducer from "./slices/locationsSlice";
import inventoryReducer from "./slices/inventorySlice";
import robotsReducer from "./slices/robotsSlice";
import usersReducer from "./slices/usersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    locations: locationsReducer,
    inventory: inventoryReducer,
    robots: robotsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

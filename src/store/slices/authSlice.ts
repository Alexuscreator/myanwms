import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";
import { mockUsers } from "@/mocks/users";

interface AuthState {
  currentUser: User | null;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ login: string; password: string }>) {
      const { login, password } = action.payload;
      const found = mockUsers.find(
        (u) => u.login === login && u.password === password,
      );

      if (!found) {
        state.error = "Неверный логин или пароль";
        state.currentUser = null;
        return;
      }

      const { password: _pw, ...safeUser } = found;
      state.currentUser = safeUser as User;
      state.error = null;
    },

    logout(state) {
      state.currentUser = null;
      state.error = null;
    },

    clearError(state) {
      state.error = null;
    },
  },
});

export const { login, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

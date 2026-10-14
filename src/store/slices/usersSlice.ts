import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Role, User } from "@/types";
import { mockUsers } from "@/mocks/users";

interface UsersState {
  items: User[];
  nextId: number;
}

const initialState: UsersState = {
  items: mockUsers,
  nextId: Math.max(...mockUsers.map((u) => u.id)) + 1,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    /**
     * Создание пользователя. Доступно только Богу — проверка на уровне UI,
     * на бэке будет Guard.
     */
    createUser(
      state,
      action: PayloadAction<{
        login: string;
        password: string;
        fullName: string;
        role: Role;
      }>,
    ) {
      const { login, password, fullName, role } = action.payload;

      // Проверка на дубликат логина
      if (state.items.some((u) => u.login === login)) return;

      state.items.push({
        id: state.nextId++,
        login,
        password, // TODO: на бэке — bcrypt
        fullName,
        role,
        createdAt: new Date().toISOString(),
      });
    },

    /**
     * Обновление пароля пользователя.
     * На бэке это будет PATCH /users/:id/password — с обязательной
     * проверкой роли (только Бог или сам пользователь).
     */
    updateUserPassword(
      state,
      action: PayloadAction<{ userId: number; newPassword: string }>,
    ) {
      const user = state.items.find((u) => u.id === action.payload.userId);
      if (!user) return;
      user.password = action.payload.newPassword; // TODO: на бэке — хеш
    },

    /**
     * Обновление ФИО. Полезно для админки.
     */
    updateUserFullName(
      state,
      action: PayloadAction<{ userId: number; fullName: string }>,
    ) {
      const user = state.items.find((u) => u.id === action.payload.userId);
      if (!user) return;
      user.fullName = action.payload.fullName;
    },

    /** Удаление пользователя */
    deleteUser(state, action: PayloadAction<number>) {
      state.items = state.items.filter((u) => u.id !== action.payload);
    },

    /** Смена роли */
    updateUserRole(
      state,
      action: PayloadAction<{ userId: number; role: Role }>,
    ) {
      const user = state.items.find((u) => u.id === action.payload.userId);
      if (user) user.role = action.payload.role;
    },
  },
});

export const {
  createUser,
  updateUserPassword,
  updateUserFullName,
  deleteUser,
  updateUserRole,
} = usersSlice.actions;
export default usersSlice.reducer;

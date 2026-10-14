import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { RobotDONOR, DonorPartsSummary } from "@/types";
import { mockRobots } from "@/mocks/robots";
import type { RootState } from "../index";

interface RobotsState {
  items: RobotDONOR[];
  nextId: number;
}

const initialState: RobotsState = {
  items: mockRobots,
  nextId: Math.max(...mockRobots.map((r) => r.id)) + 1,
};

const robotsSlice = createSlice({
  name: "robots",
  initialState,
  reducers: {
    /** Создать нового робота. Изначально запчастей нет и статус не выставлен. */
    addRobot(
      state,
      action: PayloadAction<{
        robotNumber: string;
        locationId: number;
      }>,
    ) {
      const { robotNumber, locationId } = action.payload;
      if (state.items.some((r) => r.robotNumber === robotNumber)) return;

      state.items.push({
        id: state.nextId++,
        robotNumber,
        locationId,
        // status не задаём — робот не в дефиците
        missingParts: [],
      });
    },

    /** Удалить робота */
    removeRobot(state, action: PayloadAction<number>) {
      state.items = state.items.filter((r) => r.id !== action.payload);
    },

    /** Сменить локацию робота */
    updateRobot(
      state,
      action: PayloadAction<{
        robotId: number;
        locationId?: number;
      }>,
    ) {
      const robot = state.items.find((r) => r.id === action.payload.robotId);
      if (!robot) return;
      if (action.payload.locationId !== undefined)
        robot.locationId = action.payload.locationId;
    },

    /** Добавить недостающую запчасть */
    addMissingPart(
      state,
      action: PayloadAction<{
        robotId: number;
        part: { sku: string; sku1c: string; name: string; quantity: number };
      }>,
    ) {
      const robot = state.items.find((r) => r.id === action.payload.robotId);
      if (!robot) return;

      // Суммируем, если такая запчасть уже есть
      const existing = robot.missingParts.find(
        (p) => p.sku === action.payload.part.sku,
      );
      if (existing) {
        existing.quantity += action.payload.part.quantity;
      } else {
        robot.missingParts.push(action.payload.part);
      }

      // Есть недостающие — статус WAITING_PARTS
      robot.status = "WAITING_PARTS";
    },

    /** Убрать запчасть */
    removeMissingPart(
      state,
      action: PayloadAction<{ robotId: number; sku: string }>,
    ) {
      const robot = state.items.find((r) => r.id === action.payload.robotId);
      if (!robot) return;
      robot.missingParts = robot.missingParts.filter(
        (p) => p.sku !== action.payload.sku,
      );

      // Запчастей больше нет — сбрасываем статус
      if (robot.missingParts.length === 0) {
        robot.status = undefined;
      }
    },
  },
});

export const {
  addRobot,
  removeRobot,
  updateRobot,
  addMissingPart,
  removeMissingPart,
} = robotsSlice.actions;
export default robotsSlice.reducer;

/** Свод по запчастям для доноров */
export const selectDonorPartsSummary = createSelector(
  [
    (state: RootState) => state.robots.items,
    (state: RootState) => state.locations.items,
    (state: RootState) => state.inventory.items,
  ],
  (robots, locations, inventory): DonorPartsSummary[] => {
    const map = new Map<string, DonorPartsSummary>();

    for (const robot of robots) {
      for (const part of robot.missingParts) {
        const key = `${part.sku}__${robot.locationId}`;
        const existing = map.get(key);

        if (existing) {
          existing.requiredQuantity += part.quantity;
        } else {
          const location = locations.find((l) => l.id === robot.locationId);
          const stockItem = inventory.find(
            (i) => i.locationId === robot.locationId && i.sku === part.sku,
          );

          map.set(key, {
            sku: part.sku,
            sku1c: part.sku1c,
            name: part.name,
            locationId: robot.locationId,
            locationName: location?.name ?? "—",
            requiredQuantity: part.quantity,
            availableQuantity: stockItem?.quantity ?? 0,
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const aDeficit = a.availableQuantity < a.requiredQuantity ? 0 : 1;
      const bDeficit = b.availableQuantity < b.requiredQuantity ? 0 : 1;
      if (aDeficit !== bDeficit) return aDeficit - bDeficit;
      return a.locationName.localeCompare(b.locationName);
    });
  },
);

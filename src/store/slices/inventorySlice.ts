import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import { Item, InventoryHistoryRecord, Location } from "@/types";
import { mockItems } from "@/mocks/items";
import { mockHistory } from "@/mocks/history";
import { mockLocations } from "@/mocks/locations";

interface InventoryState {
  items: Item[];
  history: InventoryHistoryRecord[];
  nextId: number;
  nextHistoryId: number;
}

const initialState: InventoryState = {
  items: mockItems,
  history: mockHistory,
  nextId: Math.max(...mockItems.map((i) => i.id)) + 1,
  nextHistoryId: Math.max(...mockHistory.map((h) => h.id)) + 1,
};

/**
 * Вспомогательная функция — создать запись в истории.
 */
function pushHistory(
  state: InventoryState,
  record: Omit<InventoryHistoryRecord, "id">,
) {
  state.history.unshift({ ...record, id: state.nextHistoryId++ });
}

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    /**
     * Добавление товара.
     */
    addItem(
      state,
      action: PayloadAction<{
        item: Omit<Item, "id">;
        userId: number;
        userName: string;
      }>,
    ) {
      const { item, userId, userName } = action.payload;
      const newItem: Item = { ...item, id: state.nextId++ };
      state.items.push(newItem);

      const location = mockLocations.find((l) => l.id === item.locationId);
      pushHistory(state, {
        itemId: newItem.id,
        itemName: newItem.name,
        sku: newItem.sku,
        sku1c: newItem.sku1c,
        locationId: newItem.locationId,
        locationName: location?.name ?? "—",
        change: newItem.quantity,
        quantityBefore: 0,
        quantityAfter: newItem.quantity,
        reason: "ADD",
        userId,
        userName,
        createdAt: new Date().toISOString(),
      });
    },

    /**
     * Перемещение товара с одной локации на другую.
     * Если на целевой локации уже есть такой SKU — увеличиваем количество.
     * Если нет — создаём новую запись Item.
     */
    moveItem(
      state,
      action: PayloadAction<{
        itemId: number;
        toLocationId: number;
        quantity: number;
        userId: number;
        userName: string;
        comment?: string;
      }>,
    ) {
      const { itemId, toLocationId, quantity, userId, userName, comment } =
        action.payload;

      const sourceItem = state.items.find((i) => i.id === itemId);
      if (!sourceItem) return;
      if (sourceItem.quantity < quantity) return;
      if (sourceItem.locationId === toLocationId) return;

      const toLocation = mockLocations.find((l) => l.id === toLocationId);
      const fromLocation = mockLocations.find(
        (l) => l.id === sourceItem.locationId,
      );

      // 1. Уменьшаем
      const qtyBeforeSource = sourceItem.quantity;
      sourceItem.quantity -= quantity;
      pushHistory(state, {
        itemId: sourceItem.id,
        itemName: sourceItem.name,
        sku: sourceItem.sku,
        sku1c: sourceItem.sku1c,
        locationId: sourceItem.locationId,
        locationName: fromLocation?.name ?? "—",
        change: -quantity,
        quantityBefore: qtyBeforeSource,
        quantityAfter: sourceItem.quantity,
        reason: "MOVE",
        comment: `Перемещение в ${toLocation?.name ?? ""}${comment ? ". " + comment : ""}`,
        userId,
        userName,
        createdAt: new Date().toISOString(),
      });

      // 2. Ищем запись на новой локе с тем же sku
      const targetItem = state.items.find(
        (i) => i.locationId === toLocationId && i.sku === sourceItem.sku,
      );

      if (targetItem) {
        const qtyBeforeTarget = targetItem.quantity;
        targetItem.quantity += quantity;
        pushHistory(state, {
          itemId: targetItem.id,
          itemName: targetItem.name,
          sku: targetItem.sku,
          sku1c: targetItem.sku1c,
          locationId: targetItem.locationId,
          locationName: toLocation?.name ?? "—",
          change: quantity,
          quantityBefore: qtyBeforeTarget,
          quantityAfter: targetItem.quantity,
          reason: "MOVE",
          comment: `Перемещение из ${fromLocation?.name ?? ""}${comment ? ". " + comment : ""}`,
          userId,
          userName,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Создаём новую запись на новой локе
        const newItem: Item = {
          ...sourceItem,
          id: state.nextId++,
          locationId: toLocationId,
          quantity,
        };
        state.items.push(newItem);
        pushHistory(state, {
          itemId: newItem.id,
          itemName: newItem.name,
          sku: newItem.sku,
          sku1c: newItem.sku1c,
          locationId: newItem.locationId,
          locationName: toLocation?.name ?? "—",
          change: quantity,
          quantityBefore: 0,
          quantityAfter: quantity,
          reason: "MOVE",
          comment: `Перемещение из ${fromLocation?.name ?? ""}${comment ? ". " + comment : ""}`,
          userId,
          userName,
          createdAt: new Date().toISOString(),
        });
      }
    },

    /**
     * руками меняем кол-во на складе (например инвент)
     */
    updateQuantity(
      state,
      action: PayloadAction<{
        itemId: number;
        newQuantity: number;
        userId: number;
        userName: string;
        comment?: string;
      }>,
    ) {
      const { itemId, newQuantity, userId, userName, comment } = action.payload;
      const item = state.items.find((i) => i.id === itemId);
      if (!item) return;

      const location = mockLocations.find((l) => l.id === item.locationId);
      const before = item.quantity;
      item.quantity = newQuantity;

      pushHistory(state, {
        itemId: item.id,
        itemName: item.name,
        sku: item.sku,
        sku1c: item.sku1c,
        locationId: item.locationId,
        locationName: location?.name ?? "—",
        change: newQuantity - before,
        quantityBefore: before,
        quantityAfter: newQuantity,
        reason: "MANUAL_EDIT",
        comment,
        userId,
        userName,
        createdAt: new Date().toISOString(),
      });
    },
  },
});

export const { addItem, moveItem, updateQuantity } = inventorySlice.actions;
export default inventorySlice.reducer;

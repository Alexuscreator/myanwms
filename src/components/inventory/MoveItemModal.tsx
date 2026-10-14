"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { moveItem } from "@/store/slices/inventorySlice";
import type { Item, Location, User } from "@/types";
import ui from "@/components/ui/ui.module.css";

interface MoveItemModalProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
}

export function MoveItemModal({ open, item, onClose }: MoveItemModalProps) {
  const locations = useAppSelector((s) => s.locations.items);
  const user = useAppSelector((s) => s.auth.currentUser);

  if (!open || !item) return null;

  return (
    <MoveItemDialog
      key={item.id}
      item={item}
      locations={locations}
      user={user}
      onClose={onClose}
    />
  );
}

interface MoveItemDialogProps {
  item: Item;
  locations: Location[];
  user: User | null;
  onClose: () => void;
}

function MoveItemDialog({ item, locations, user, onClose }: MoveItemDialogProps) {
  const dispatch = useAppDispatch();

  const [toLocationId, setToLocationId] = useState<number>(
    () => locations.find((l) => l.id !== item.locationId)?.id ?? 0,
  );
  const [quantity, setQuantity] = useState<number>(
    () => Math.min(1, item.quantity),
  );
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (quantity <= 0) return setError("Количество должно быть больше нуля");
    if (quantity > item.quantity)
      return setError(`Недостаточно товара. Доступно: ${item.quantity}`);
    if (toLocationId === item.locationId)
      return setError("Выберите другую локацию");

    dispatch(
      moveItem({
        itemId: item.id,
        toLocationId,
        quantity,
        userId: user.id,
        userName: user.fullName,
        comment,
      }),
    );

    onClose();
  };

  const fromLocation = locations.find((l) => l.id === item.locationId);

  return (
    <Modal
      open
      title="Перемещение товара"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            Переместить
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <div className={ui.field}>
          <label className={ui.label}>Товар</label>
          <div style={{ fontWeight: 500 }}>
            {item.name}{" "}
            <span style={{ color: "var(--color-text-muted)" }}>
              ({item.sku})
            </span>
          </div>
        </div>

        <div className={ui.field}>
          <label className={ui.label}>Откуда</label>
          <input
            className={ui.input}
            value={`${fromLocation?.name ?? "—"} (доступно: ${item.quantity})`}
            disabled
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label}>Куда</label>
          <select
            className={ui.select}
            value={toLocationId}
            onChange={(e) => setToLocationId(Number(e.target.value))}
          >
            {locations
              .filter((l) => l.id !== item.locationId)
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
          </select>
        </div>

        <div className={ui.field}>
          <label className={ui.label}>Количество</label>
          <input
            className={ui.input}
            type="number"
            min={1}
            max={item.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label}>Комментарий (опционально)</label>
          <input
            className={ui.input}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {error && <div className={ui.error}>{error}</div>}
      </form>
    </Modal>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/inventorySlice";
import ui from "@/components/ui/ui.module.css";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddItemModal({ open, onClose }: AddItemModalProps) {
  const dispatch = useAppDispatch();
  const locations = useAppSelector((s) => s.locations.items);
  const user = useAppSelector((s) => s.auth.currentUser);

  const [locationId, setLocationId] = useState<number>(locations[0]?.id ?? 0);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [sku1c, setSku1c] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [storagePlace, setStoragePlace] = useState("");
  const [needForDonors, setNeedForDonors] = useState<number>(0);
  const [photoUrl, setPhotoUrl] = useState("");

  const reset = () => {
    setName("");
    setSku("");
    setSku1c("");
    setQuantity(0);
    setStoragePlace("");
    setNeedForDonors(0);
    setPhotoUrl("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    dispatch(
      addItem({
        item: {
          locationId,
          name,
          sku,
          sku1c,
          quantity,
          storagePlace,
          needForDonors,
          photoUrl,
        },
        userId: user.id,
        userName: user.fullName,
      }),
    );

    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Добавить товар"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            Сохранить
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <div className={ui.field}>
          <label className={ui.label}>Локация</label>
          <select
            className={ui.select}
            value={locationId}
            onChange={(e) => setLocationId(Number(e.target.value))}
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className={ui.field}>
          <label className={ui.label}>Наименование</label>
          <input
            className={ui.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div className={ui.field}>
            <label className={ui.label}>SKU</label>
            <input
              className={ui.input}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>SKU 1C</label>
            <input
              className={ui.input}
              value={sku1c}
              onChange={(e) => setSku1c(e.target.value)}
            />
          </div>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div className={ui.field}>
            <label className={ui.label}>Количество</label>
            <input
              className={ui.input}
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Нужно на доноров</label>
            <input
              className={ui.input}
              type="number"
              min={0}
              value={needForDonors}
              onChange={(e) => setNeedForDonors(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={ui.field}>
          <label className={ui.label}>Место хранения</label>
          <input
            className={ui.input}
            value={storagePlace}
            onChange={(e) => setStoragePlace(e.target.value)}
            placeholder="Например: A-01-03"
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label}>URL фото (опционально)</label>
          <input
            className={ui.input}
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </form>
    </Modal>
  );
}

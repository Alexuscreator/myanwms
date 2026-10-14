"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMissingPart } from "@/store/slices/robotsSlice";
import { RobotDONOR } from "@/types";
import ui from "@/components/ui/ui.module.css";

interface AddMissingPartModalProps {
  open: boolean;
  robot: RobotDONOR | null;
  onClose: () => void;
}

export function AddMissingPartModal({
  open,
  robot,
  onClose,
}: AddMissingPartModalProps) {
  const dispatch = useAppDispatch();
  const inventory = useAppSelector((s) => s.inventory.items);

  const [sku, setSku] = useState("");
  const [sku1c, setSku1c] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  if (!robot) return null;

  /**
   * Уникальные товары по SKU (в inventory один и тот же SKU
   * может быть на нескольких локациях — нам нужен один пример).
   */
  const uniqueItems = Array.from(
    new Map(inventory.map((i) => [i.sku, i])).values(),
  );

  /**
   * Пользователь выбирает наименование — подтягиваем SKU, SKU1C и name.
   * Значение option — это index в uniqueItems, чтобы отличать
   * товары с одинаковым наименованием (если такие есть).
   */
  const onSelectByName = (value: string) => {
    if (!value) return;
    const idx = Number(value);
    const found = uniqueItems[idx];
    if (!found) return;
    setName(found.name);
    setSku(found.sku);
    setSku1c(found.sku1c);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedSku = sku.trim();
    if (!trimmedSku) {
      setError("Выберите запчасть из справочника или введите SKU вручную");
      return;
    }
    if (quantity <= 0) {
      setError("Количество должно быть больше нуля");
      return;
    }

    dispatch(
      addMissingPart({
        robotId: robot.id,
        part: {
          sku: trimmedSku,
          sku1c: sku1c.trim(),
          name: name.trim() || trimmedSku,
          quantity,
        },
      }),
    );

    onClose();
  };

  return (
    <Modal
      open={open}
      title={`Добавить запчасть — ${robot.robotNumber}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            Добавить
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        {/* Селект по наименованию — основной способ выбора */}
        <div className={ui.field}>
          <label className={ui.label}>Выбрать из справочника</label>
          <select
            className={ui.select}
            value=""
            onChange={(e) => onSelectByName(e.target.value)}
          >
            <option value="">— выберите наименование —</option>
            {uniqueItems.map((item, idx) => (
              <option key={item.sku} value={idx}>
                {item.name} ({item.sku})
              </option>
            ))}
          </select>
        </div>

        {/* Поля ниже — заполняются автоматически, но можно править вручную */}
        <div className={ui.field}>
          <label className={ui.label}>Наименование</label>
          <input
            className={ui.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: Лидар"
          />
        </div>

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

        <div className={ui.field}>
          <label className={ui.label}>Не хватает (шт.)</label>
          <input
            className={ui.input}
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>

        {error && <div className={ui.error}>{error}</div>}
      </form>
    </Modal>
  );
}

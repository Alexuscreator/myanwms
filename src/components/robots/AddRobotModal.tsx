"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addRobot } from "@/store/slices/robotsSlice";
import ui from "@/components/ui/ui.module.css";

interface AddRobotModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddRobotModal({ open, onClose }: AddRobotModalProps) {
  const dispatch = useAppDispatch();
  const locations = useAppSelector((s) => s.locations.items);
  const robots = useAppSelector((s) => s.robots.items);

  const [robotNumber, setRobotNumber] = useState("");
  const [locationId, setLocationId] = useState<number>(locations[0]?.id ?? 0);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = robotNumber.trim();
    if (!trimmed) {
      setError("Введите номер робота");
      return;
    }
    if (robots.some((r) => r.robotNumber === trimmed)) {
      setError("Робот с таким номером уже существует");
      return;
    }

    dispatch(addRobot({ robotNumber: trimmed, locationId }));
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Добавить робота-донора"
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
        <div className={ui.field}>
          <label className={ui.label}>Номер робота</label>
          <input
            className={ui.input}
            value={robotNumber}
            onChange={(e) => setRobotNumber(e.target.value)}
            placeholder="R-004"
            autoFocus
            required
          />
        </div>

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

        {error && <div className={ui.error}>{error}</div>}
      </form>
    </Modal>
  );
}

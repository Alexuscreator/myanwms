"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAppDispatch } from "@/store/hooks";
import { updateUserPassword } from "@/store/slices/usersSlice";
import { User } from "@/types";
import ui from "@/components/ui/ui.module.css";

interface ChangePasswordModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

export function ChangePasswordModal({
  open,
  user,
  onClose,
}: ChangePasswordModalProps) {
  const dispatch = useAppDispatch();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 3) {
      setError("Пароль должен содержать минимум 3 символа");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    dispatch(
      updateUserPassword({
        userId: user.id,
        newPassword: password,
      }),
    );

    onClose();
  };

  return (
    <Modal
      open={open}
      title={`Сменить пароль — ${user.login}`}
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
          <label className={ui.label}>Новый пароль для {user.fullName}</label>
          <input
            className={ui.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label}>Повторите пароль</label>
          <input
            className={ui.input}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        {error && <div className={ui.error}>{error}</div>}
      </form>
    </Modal>
  );
}

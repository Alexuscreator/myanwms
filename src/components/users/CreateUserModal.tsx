"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createUser } from "@/store/slices/usersSlice";
import { Role } from "@/types";
import { ROLE_LABELS } from "@/utils/roles";
import ui from "@/components/ui/ui.module.css";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

const ALL_ROLES: Role[] = [
  Role.GOD,
  Role.LEAD_INVENTORY_MANAGER,
  Role.SENIOR_INVENTORY_MANAGER,
  Role.INVENTORY_MANAGER,
  Role.WAREHOUSE_HEAD,
  Role.SENIOR_WAREHOUSE_SPECIALIST,
  Role.WAREHOUSE_SPECIALIST,
];

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const dispatch = useAppDispatch();
  const users = useAppSelector((s) => s.users.items);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>(Role.WAREHOUSE_SPECIALIST);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedLogin = login.trim();
    if (trimmedLogin.length < 3) {
      setError("Логин должен содержать минимум 3 символа");
      return;
    }
    if (password.length < 3) {
      setError("Пароль должен содержать минимум 3 символа");
      return;
    }
    if (
      users.some((u) => u.login.toLowerCase() === trimmedLogin.toLowerCase())
    ) {
      setError("Пользователь с таким логином уже существует");
      return;
    }

    dispatch(
      createUser({
        login: trimmedLogin,
        password,
        fullName: fullName.trim() || trimmedLogin,
        role,
      }),
    );

    onClose();
  };

  return (
    <Modal
      open={open}
      title="Создать пользователя"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            Создать
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <div className={ui.field}>
          <label className={ui.label}>Логин</label>
          <input
            className={ui.input}
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label}>Пароль</label>
          <input
            className={ui.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label}>ФИО</label>
          <input
            className={ui.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Иванов Иван Иванович"
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label}>Роль</label>
          <select
            className={ui.select}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        {error && <div className={ui.error}>{error}</div>}
      </form>
    </Modal>
  );
}

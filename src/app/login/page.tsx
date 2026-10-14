"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearError, login } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";
import ui from "@/components/ui/ui.module.css";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser, error } = useAppSelector((s) => s.auth);

  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  // Если уже авторизован — сразу на /inventory
  useEffect(() => {
    if (currentUser) router.replace("/inventory");
  }, [currentUser, router]);

  // Сброс ошибки при вводе
  useEffect(() => {
    if (error) dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginValue, passwordValue]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(login({ login: loginValue.trim(), password: passwordValue }));
  };

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 className={styles.title}>
          WMS<span style={{ color: "var(--color-primary)" }}>очка</span>
        </h1>
        <p className={styles.subtitle}>Упрощаем жизнь</p>

        <div className={ui.field}>
          <label className={ui.label}>Логин</label>
          <input
            className={ui.input}
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label}>Пароль</label>
          <input
            className={ui.input}
            type="password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            required
          />
        </div>

        {error && <div className={ui.error}>{error}</div>}

        <Button
          type="submit"
          variant="primary"
          className={styles.submitBtn}
          style={{ width: "100%", marginTop: 8 }}
        >
          Войти
        </Button>

        <div className={styles.hint}>
          <div className={styles.hintTitle}>Тестовые учётки:</div>
          god / god — Бог
          <br />
          lead / lead — Ведущий менеджер
          <br />
          manager / manager — Менеджер
          <br />
          warehouse / warehouse — Специалист склада
        </div>
      </form>
    </div>
  );
}

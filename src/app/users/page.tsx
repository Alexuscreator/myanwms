"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Th } from "@/components/ui/Th";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteUser, updateUserRole } from "@/store/slices/usersSlice";
import { CreateUserModal } from "@/components/users/CreateUserModal";
import { ChangePasswordModal } from "@/components/users/ChangePasswordModal";
import { Role, User } from "@/types";
import { ROLE_LABELS } from "@/utils/roles";
import { formatDateTime } from "@/utils/format";
import { matchesFilter, useColumnFilters } from "@/components/ui/ColumnFilter";
import { useSort } from "@/hooks/useSort";
import styles from "./users.module.css";

const ALL_ROLES: Role[] = [
  Role.GOD,
  Role.LEAD_INVENTORY_MANAGER,
  Role.SENIOR_INVENTORY_MANAGER,
  Role.INVENTORY_MANAGER,
  Role.WAREHOUSE_HEAD,
  Role.SENIOR_WAREHOUSE_SPECIALIST,
  Role.WAREHOUSE_SPECIALIST,
];

export default function UsersPage() {
  // ═══════════════════════════════════════════════════════
  // 1. ВСЕ ХУКИ — в самом верху, без условий
  // ═══════════════════════════════════════════════════════
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const users = useAppSelector((s) => s.users.items);

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);

  const userFilters = useColumnFilters();

  // Фильтрация — считается всегда, даже если текущий юзер не Бог.
  // Это безопасно: просто вычисление, никаких сайд-эффектов.
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!matchesFilter(userFilters.values.id, u.id)) return false;
      if (!matchesFilter(userFilters.values.login, u.login)) return false;
      if (!matchesFilter(userFilters.values.fullName, u.fullName)) return false;
      if (!matchesFilter(userFilters.values.role, ROLE_LABELS[u.role]))
        return false;
      return true;
    });
  }, [users, userFilters.values]);

  // Сортировка — тоже всегда
  const {
    sorted: sortedUsers,
    sort: userSort,
    toggle: userToggleSort,
  } = useSort<User>(filteredUsers, (u, key) => {
    switch (key) {
      case "id":
        return u.id;
      case "login":
        return u.login;
      case "fullName":
        return u.fullName;
      case "role":
        return ROLE_LABELS[u.role];
      case "createdAt":
        return u.createdAt;
      default:
        return "";
    }
  });

  const dirFor = (key: string) =>
    userSort.key === key ? userSort.direction : null;

  // ═══════════════════════════════════════════════════════
  // 2. Условный рендер — только ПОСЛЕ всех хуков
  // ═══════════════════════════════════════════════════════
  const isGod = currentUser?.role === Role.GOD;

  if (!isGod) {
    return (
      <AppLayout title="Пользователи">
        <div className={styles.denied}>
          <div className={styles.deniedIcon}>🔒</div>
          <div className={styles.deniedTitle}>Доступ запрещён</div>
          <div>Управление пользователями доступно только роли «Бог».</div>
          <Button
            variant="secondary"
            style={{ marginTop: 20 }}
            onClick={() => router.push("/inventory")}
          >
            Вернуться к товарам
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ═══════════════════════════════════════════════════════
  // 3. Обработчики (не хуки — можно где угодно)
  // ═══════════════════════════════════════════════════════
  const onChangeRole = (userId: number, role: Role) => {
    dispatch(updateUserRole({ userId, role }));
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    dispatch(deleteUser(deleteTarget.id));
    setDeleteTarget(null);
  };

  // ═══════════════════════════════════════════════════════
  // 4. Основной рендер
  // ═══════════════════════════════════════════════════════
  return (
    <AppLayout title="Пользователи">
      <div className={styles.toolbar}>
        <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
          Всего: {users.length}
        </span>

        {Object.keys(userFilters.values).length > 0 && (
          <button
            className={styles.toolbarClearBtn}
            onClick={userFilters.clearAll}
          >
            Сбросить фильтры
          </button>
        )}

        <div className={styles.spacer} />
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          + Создать пользователя
        </Button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <Th
                label="ID"
                sortKey="id"
                sortDirection={dirFor("id")}
                onSort={userToggleSort}
                filter={{ type: "text" }}
                filterValue={userFilters.values.id ?? null}
                onFilterChange={(v) => userFilters.setFilter("id", v)}
              />
              <Th
                label="Логин"
                sortKey="login"
                sortDirection={dirFor("login")}
                onSort={userToggleSort}
                filter={{ type: "text" }}
                filterValue={userFilters.values.login ?? null}
                onFilterChange={(v) => userFilters.setFilter("login", v)}
              />
              <Th
                label="ФИО"
                sortKey="fullName"
                sortDirection={dirFor("fullName")}
                onSort={userToggleSort}
                filter={{ type: "text" }}
                filterValue={userFilters.values.fullName ?? null}
                onFilterChange={(v) => userFilters.setFilter("fullName", v)}
              />
              <Th
                label="Роль"
                sortKey="role"
                sortDirection={dirFor("role")}
                onSort={userToggleSort}
                filter={{
                  type: "select",
                  options: Array.from(
                    new Set(users.map((u) => ROLE_LABELS[u.role])),
                  ),
                }}
                filterValue={userFilters.values.role ?? null}
                onFilterChange={(v) => userFilters.setFilter("role", v)}
              />
              <Th
                label="Создан"
                sortKey="createdAt"
                sortDirection={dirFor("createdAt")}
                onSort={userToggleSort}
              />
              <th style={{ width: 200 }}></th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((u) => {
              const isSelf = u.id === currentUser.id;
              return (
                <tr key={u.id}>
                  <td style={{ color: "var(--color-text-muted)" }}>#{u.id}</td>
                  <td className={styles.login}>
                    {u.login}
                    {isSelf && <span className={styles.selfMark}>(вы)</span>}
                  </td>
                  <td>{u.fullName}</td>
                  <td className={styles.roleCell}>
                    <select
                      className={styles.roleSelect}
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) =>
                        onChangeRole(u.id, e.target.value as Role)
                      }
                    >
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ color: "var(--color-text-muted)" }}>
                    {formatDateTime(u.createdAt)}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPasswordTarget(u)}
                      >
                        Пароль
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={isSelf}
                        onClick={() => setDeleteTarget(u)}
                        title={isSelf ? "Нельзя удалить себя" : "Удалить"}
                      >
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CreateUserModal
        key={createOpen ? "create-open" : "create-closed"}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <ChangePasswordModal
        key={passwordTarget?.id ?? "no-password-target"}
        open={!!passwordTarget}
        user={passwordTarget}
        onClose={() => setPasswordTarget(null)}
      />

      <Modal
        open={!!deleteTarget}
        title="Удалить пользователя?"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Отмена
            </Button>
            <Button variant="danger" onClick={onConfirmDelete}>
              Удалить
            </Button>
          </>
        }
      >
        {deleteTarget && (
          <div>
            Вы действительно хотите удалить пользователя{" "}
            <b>{deleteTarget.login}</b> ({deleteTarget.fullName})?
            <div style={{ marginTop: 10, color: "var(--color-danger)" }}>
              Действие необратимо.
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

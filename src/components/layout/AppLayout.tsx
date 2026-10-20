"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { hasPermission, ROLE_LABELS } from "@/utils/roles";
import { Role } from "@/types";
import { Button } from "@/components/ui/Button";
import styles from "./Layout.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  requiredRole?: Role[];
}

const NAV: NavItem[] = [
  { href: "/inventory", label: "Запчасти", icon: "📦" },
  { href: "/robots", label: "Роботы-доноры", icon: "🤖" },
  // Пункт "Пользователи" — только для Бога
  {
    href: "/users",
    label: "Пользователи",
    icon: "👥",
    requiredRole: [Role.GOD],
  },
];

export function AppLayout({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.currentUser);


  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) {
    return <div style={{ padding: 24 }}>Загрузка…</div>;
  }

  const onLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  const visibleNav = NAV.filter((item) => {
    if (!item.requiredRole) return true;
    return item.requiredRole.includes(user.role);
  });

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          WMS<span className={styles.logoDot}>очка</span>
        </div>
        <nav className={styles.nav}>
          {visibleNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.pageTitle}>{title}</div>
          <div className={styles.userBox}>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.fullName}</div>
              <div className={styles.userRole}>{ROLE_LABELS[user.role]}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={onLogout}>
              Выйти
            </Button>
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

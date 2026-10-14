"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./ui.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "secondary";
  size?: "md" | "sm";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? styles.btnPrimary
      : variant === "danger"
        ? styles.btnDanger
        : styles.btnSecondary;

  const sizeClass = size === "sm" ? styles.btnSm : "";

  return (
    <button
      className={`${styles.btn} ${variantClass} ${sizeClass} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}

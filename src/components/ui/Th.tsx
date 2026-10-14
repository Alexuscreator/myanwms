"use client";

import { ReactNode } from "react";
import { ColumnFilter, FilterConfig, FilterValue } from "./ColumnFilter";
import { SortDirection } from "@/hooks/useSort";
import styles from "./Th.module.css";

interface ThProps {
  /** Заголовок колонки */
  label: string;
  /** Ключ для сортировки (обязателен, если isSortable) */
  sortKey?: string;
  /** Текущее направление сортировки (если колонка активна) */
  sortDirection?: SortDirection | null;
  /** Клик по заголовку — переключить сортировку */
  onSort?: (key: string) => void;
  /** Конфиг фильтра. Если не передан — фильтра нет. */
  filter?: FilterConfig;
  /** Значение фильтра */
  filterValue?: FilterValue;
  /** Обработчик изменения фильтра */
  onFilterChange?: (v: FilterValue) => void;
  /** Опциональная ширина колонки */
  width?: number | string;
  /** Что рендерить вместо label (если нужно) */
  children?: ReactNode;
}

export function Th({
  label,
  sortKey,
  sortDirection,
  onSort,
  filter,
  filterValue,
  onFilterChange,
  width,
}: ThProps) {
  const isSortable = !!sortKey && !!onSort;
  const isActive = sortDirection != null;

  return (
    <th style={width ? { width } : undefined}>
      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <span
            className={`${styles.label} ${isSortable ? styles.sortable : ""}`}
            onClick={isSortable ? () => onSort(sortKey!) : undefined}
            title={isSortable ? "Сортировать" : undefined}
          >
            {label}
            {isSortable && (
              <span className={styles.arrow}>
                {isActive ? (sortDirection === "asc" ? " ▲" : " ▼") : " ⇅"}
              </span>
            )}
          </span>
        </div>

        {filter && (
          <div className={styles.filterRow}>
            <ColumnFilter
              config={filter}
              value={filterValue ?? null}
              onChange={(v) => onFilterChange?.(v)}
            />
          </div>
        )}
      </div>
    </th>
  );
}

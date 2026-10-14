"use client";

import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string | null;
  direction: SortDirection;
}

/**
 * Хук сортировки для произвольного массива.
 *
 * @param items       — исходный массив
 * @param getValue    — функция «по элементу вернуть значение по ключу сортировки»
 * @param initial     — стартовое состояние (обычно null / asc)
 */
export function useSort<T>(
  items: T[],
  getValue: (item: T, key: string) => string | number,
  initial: SortState = { key: null, direction: "asc" },
) {
  const [sort, setSort] = useState<SortState>(initial);

  /** Клик по заголовку: asc → desc → снять */
  const toggle = (key: string) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: "asc" }; // третий клик — снять сортировку
    });
  };

  const sorted = useMemo(() => {
    if (!sort.key) return items;
    const key = sort.key;
    const dir = sort.direction === "asc" ? 1 : -1;

    // Копия — не мутируем оригинал
    return [...items].sort((a, b) => {
      const va = getValue(a, key);
      const vb = getValue(b, key);

      // Числа — численно
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * dir;
      }

      // Строки — localeCompare (корректно сортирует русский)
      return (
        String(va).localeCompare(String(vb), "ru", {
          numeric: true,
          sensitivity: "base",
        }) * dir
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, sort.key, sort.direction]);

  return { sorted, sort, toggle };
}

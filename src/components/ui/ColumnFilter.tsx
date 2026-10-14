"use client";

import { useState } from "react";
import ui from "./ui.module.css";
import styles from "./ColumnFilter.module.css";

type TextFilter = { type: "text" };
type SelectFilter = { type: "select"; options: string[] };
type NumberRangeFilter = { type: "range" };

export type FilterConfig = TextFilter | SelectFilter | NumberRangeFilter;

/** Значение фильтра: строка для text/select, пара чисел для range */
export type FilterValue =
  | { type: "text"; value: string }
  | { type: "select"; value: string }
  | { type: "range"; min: string; max: string }
  | null;

interface ColumnFilterProps {
  config: FilterConfig;
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}

export function ColumnFilter({ config, value, onChange }: ColumnFilterProps) {
  if (config.type === "text") {
    const v = value?.type === "text" ? value.value : "";
    return (
      <input
        className={styles.input}
        placeholder="фильтр…"
        value={v}
        onChange={(e) =>
          onChange(
            e.target.value ? { type: "text", value: e.target.value } : null,
          )
        }
      />
    );
  }

  if (config.type === "select") {
    const v = value?.type === "select" ? value.value : "";
    return (
      <select
        className={styles.select}
        value={v}
        onChange={(e) =>
          onChange(
            e.target.value ? { type: "select", value: e.target.value } : null,
          )
        }
      >
        <option value="">все</option>
        {config.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  // range
  const minVal = value?.type === "range" ? value.min : "";
  const maxVal = value?.type === "range" ? value.max : "";
  return (
    <div className={styles.range}>
      <input
        className={styles.input}
        placeholder="от"
        type="number"
        value={minVal}
        onChange={(e) =>
          onChange(
            e.target.value || maxVal
              ? { type: "range", min: e.target.value, max: maxVal }
              : null,
          )
        }
      />
      <input
        className={styles.input}
        placeholder="до"
        type="number"
        value={maxVal}
        onChange={(e) =>
          onChange(
            e.target.value || minVal
              ? { type: "range", min: minVal, max: e.target.value }
              : null,
          )
        }
      />
    </div>
  );
}

/**
 * Хук для управления набором фильтров по колонкам.
 * Возвращает [values, setFilter, clearAll].
 */
export function useColumnFilters() {
  const [values, setValues] = useState<Record<string, FilterValue>>({});

  const setFilter = (key: string, v: FilterValue) => {
    setValues((prev) => {
      const next = { ...prev };
      if (v === null) delete next[key];
      else next[key] = v;
      return next;
    });
  };

  const clearAll = () => setValues({});

  return { values, setFilter, clearAll };
}

/**
 * Проверяет, проходит ли значение через фильтр.
 */
export function matchesFilter(
  filter: FilterValue | undefined,
  rawValue: string | number,
): boolean {
  if (!filter) return true;

  const str = String(rawValue).toLowerCase();

  if (filter.type === "text") {
    return str.includes(filter.value.toLowerCase());
  }

  if (filter.type === "select") {
    return str === filter.value.toLowerCase();
  }

  // range — работает только для чисел
  const num = Number(rawValue);
  if (Number.isNaN(num)) return true;
  const min = filter.min !== "" ? Number(filter.min) : -Infinity;
  const max = filter.max !== "" ? Number(filter.max) : Infinity;
  return num >= min && num <= max;
}

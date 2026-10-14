"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Th } from "@/components/ui/Th";
import { useAppSelector } from "@/store/hooks";
import { hasPermission } from "@/utils/roles";
import { Item } from "@/types";
import { AddItemModal } from "@/components/inventory/AddItemModal";
import { MoveItemModal } from "@/components/inventory/MoveItemModal";
import { matchesFilter, useColumnFilters } from "@/components/ui/ColumnFilter";
import { useSort } from "@/hooks/useSort";
import styles from "./inventory.module.css";
import ui from "@/components/ui/ui.module.css";

export default function InventoryPage() {
  const router = useRouter();
  const items = useAppSelector((s) => s.inventory.items);
  const locations = useAppSelector((s) => s.locations.items);
  const user = useAppSelector((s) => s.auth.currentUser);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState<number | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<Item | null>(null);

  const { values, setFilter, clearAll } = useColumnFilters();

  const locationName = (id: number) =>
    locations.find((l) => l.id === id)?.name ?? "—";

  const uniqueLocations = useMemo(
    () => Array.from(new Set(items.map((i) => locationName(i.locationId)))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, locations],
  );

  // ── 1) Фильтрация ───────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (q) {
        const hit =
          i.sku.toLowerCase().includes(q) ||
          i.sku1c.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (locationFilter !== "all" && i.locationId !== locationFilter)
        return false;

      if (!matchesFilter(values.id, i.id)) return false;
      if (!matchesFilter(values.name, i.name)) return false;
      if (!matchesFilter(values.sku, i.sku)) return false;
      if (!matchesFilter(values.sku1c, i.sku1c)) return false;
      if (!matchesFilter(values.location, locationName(i.locationId)))
        return false;
      if (!matchesFilter(values.storagePlace, i.storagePlace)) return false;
      if (!matchesFilter(values.quantity, i.quantity)) return false;
      if (!matchesFilter(values.needForDonors, i.needForDonors)) return false;

      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, locationFilter, values, locations]);

  // ── 2) Сортировка ───────────────────────────────────────
  const { sorted, sort, toggle } = useSort<Item>(filtered, (item, key) => {
    switch (key) {
      case "id":
        return item.id;
      case "name":
        return item.name;
      case "sku":
        return item.sku;
      case "sku1c":
        return item.sku1c;
      case "location":
        return locationName(item.locationId);
      case "storagePlace":
        return item.storagePlace;
      case "quantity":
        return item.quantity;
      case "needForDonors":
        return item.needForDonors;
      default:
        return "";
    }
  });

  const hasAnyColumnFilter = Object.keys(values).length > 0;

  // Утилита: текущее направление сортировки для Th
  const dirFor = (key: string) => (sort.key === key ? sort.direction : null);

  return (
    <AppLayout title="Товары на локациях">
      <div className={styles.toolbar}>
        <input
          className={`${ui.input} ${styles.search}`}
          placeholder="Поиск по SKU, SKU 1C или наименованию…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={`${ui.select} ${styles.locationFilter}`}
          value={locationFilter}
          onChange={(e) =>
            setLocationFilter(
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
        >
          <option value="all">Все локации</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        {hasAnyColumnFilter && (
          <button className={styles.toolbarClearBtn} onClick={clearAll}>
            Сбросить фильтры
          </button>
        )}

        <div className={styles.spacer} />

        {hasPermission(user?.role ?? null, "ADD_ITEM") && (
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            + Добавить товар
          </Button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        {sorted.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <div>Ничего не найдено</div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 56 }}>Фото</th>
                <Th
                  label="ID"
                  sortKey="id"
                  sortDirection={dirFor("id")}
                  onSort={toggle}
                  filter={{ type: "text" }}
                  filterValue={values.id ?? null}
                  onFilterChange={(v) => setFilter("id", v)}
                />
                <Th
                  label="Наименование"
                  sortKey="name"
                  sortDirection={dirFor("name")}
                  onSort={toggle}
                  filter={{ type: "text" }}
                  filterValue={values.name ?? null}
                  onFilterChange={(v) => setFilter("name", v)}
                />
                <Th
                  label="SKU"
                  sortKey="sku"
                  sortDirection={dirFor("sku")}
                  onSort={toggle}
                  filter={{ type: "text" }}
                  filterValue={values.sku ?? null}
                  onFilterChange={(v) => setFilter("sku", v)}
                />
                <Th
                  label="SKU 1C"
                  sortKey="sku1c"
                  sortDirection={dirFor("sku1c")}
                  onSort={toggle}
                  filter={{ type: "text" }}
                  filterValue={values.sku1c ?? null}
                  onFilterChange={(v) => setFilter("sku1c", v)}
                />
                <Th
                  label="Локация"
                  sortKey="location"
                  sortDirection={dirFor("location")}
                  onSort={toggle}
                  filter={{ type: "select", options: uniqueLocations }}
                  filterValue={values.location ?? null}
                  onFilterChange={(v) => setFilter("location", v)}
                />
                <Th
                  label="Место хранения"
                  sortKey="storagePlace"
                  sortDirection={dirFor("storagePlace")}
                  onSort={toggle}
                  filter={{ type: "text" }}
                  filterValue={values.storagePlace ?? null}
                  onFilterChange={(v) => setFilter("storagePlace", v)}
                />
                <Th
                  label="Кол-во"
                  sortKey="quantity"
                  sortDirection={dirFor("quantity")}
                  onSort={toggle}
                  filter={{ type: "range" }}
                  filterValue={values.quantity ?? null}
                  onFilterChange={(v) => setFilter("quantity", v)}
                />
                <Th
                  label="Нужно на доноров"
                  sortKey="needForDonors"
                  sortDirection={dirFor("needForDonors")}
                  onSort={toggle}
                  filter={{ type: "range" }}
                  filterValue={values.needForDonors ?? null}
                  onFilterChange={(v) => setFilter("needForDonors", v)}
                />
                <th style={{ width: 130 }}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => {
                const deficit = item.quantity < item.needForDonors;
                const qtyClass =
                  item.quantity === 0
                    ? styles.qtyZero
                    : deficit
                      ? styles.qtyLow
                      : styles.qtyOk;

                return (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.photo}>
                        {item.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.photoUrl}
                            alt={item.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        ) : (
                          "📦"
                        )}
                      </div>
                    </td>
                    <td className={styles.sku}>#{item.id}</td>
                    <td className={styles.name}>{item.name}</td>
                    <td className={styles.sku}>{item.sku}</td>
                    <td className={styles.sku}>{item.sku1c || "—"}</td>
                    <td>{locationName(item.locationId)}</td>
                    <td className={styles.sku}>{item.storagePlace || "—"}</td>
                    <td className={qtyClass}>{item.quantity}</td>
                    <td>
                      <span
                        className={
                          deficit
                            ? `${ui.badge} ${ui.badgeRed}`
                            : `${ui.badge} ${ui.badgeGray}`
                        }
                      >
                        {item.needForDonors}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => router.push(`/inventory/${item.id}`)}
                        >
                          Открыть
                        </Button>
                        {hasPermission(user?.role ?? null, "MOVE_ITEM") &&
                          item.quantity > 0 && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => setMoveTarget(item)}
                            >
                              →
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} />
      <MoveItemModal
        key={moveTarget?.id ?? "none"}
        open={!!moveTarget}
        item={moveTarget}
        onClose={() => setMoveTarget(null)}
      />
    </AppLayout>
  );
}

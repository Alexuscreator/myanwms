"use client";

import { Fragment, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Th } from "@/components/ui/Th";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  removeRobot,
  removeMissingPart,
  selectDonorPartsSummary,
} from "@/store/slices/robotsSlice";
import { AddRobotModal } from "@/components/robots/AddRobotModal";
import { AddMissingPartModal } from "@/components/robots/AddMissingPartModal";
import { matchesFilter, useColumnFilters } from "@/components/ui/ColumnFilter";
import { useSort } from "@/hooks/useSort";
import { RobotDONOR } from "@/types";
import styles from "./robots.module.css";
import ui from "@/components/ui/ui.module.css";

export default function RobotsPage() {
  const dispatch = useAppDispatch();
  const robots = useAppSelector((s) => s.robots.items);
  const locations = useAppSelector((s) => s.locations.items);
  const summary = useAppSelector(selectDonorPartsSummary);

  // ── Разворот строк ─────────────────────────────────────
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // ── Фильтры по столбцам ────────────────────────────────
  const robotFilters = useColumnFilters();
  const summaryFilters = useColumnFilters();

  // ── Модалки ────────────────────────────────────────────
  const [addRobotOpen, setAddRobotOpen] = useState(false);
  const [partTarget, setPartTarget] = useState<RobotDONOR | null>(null);

  // ── Хелперы ────────────────────────────────────────────
  const toggleRow = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const locationName = (id: number) =>
    locations.find((l) => l.id === id)?.name ?? "—";

  const deficitRobotsCount = useMemo(
    () => robots.filter((r) => r.missingParts.length > 0).length,
    [robots],
  );

  const onRemoveRobot = (robot: RobotDONOR) => {
    if (confirm(`Удалить робота ${robot.robotNumber}? Действие необратимо.`)) {
      dispatch(removeRobot(robot.id));
    }
  };

  // ── Фильтрация роботов ─────────────────────────────────
  const filteredRobots = useMemo(() => {
    return robots.filter((r) => {
      const statusLabel = r.status === "WAITING_PARTS" ? "Ждёт запчасти" : "—";

      if (!matchesFilter(robotFilters.values.robotNumber, r.robotNumber))
        return false;
      if (
        !matchesFilter(robotFilters.values.location, locationName(r.locationId))
      )
        return false;
      if (!matchesFilter(robotFilters.values.status, statusLabel)) return false;
      if (!matchesFilter(robotFilters.values.partsCount, r.missingParts.length))
        return false;

      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robots, robotFilters.values, locations]);

  // ── Сортировка роботов ─────────────────────────────────
  const {
    sorted: sortedRobots,
    sort: robotSort,
    toggle: robotToggleSort,
  } = useSort<RobotDONOR>(filteredRobots, (r, key) => {
    switch (key) {
      case "robotNumber":
        return r.robotNumber;
      case "location":
        return locationName(r.locationId);
      case "status":
        return r.status === "WAITING_PARTS" ? "Ждёт запчасти" : "—";
      case "partsCount":
        return r.missingParts.length;
      default:
        return "";
    }
  });

  // ── Фильтрация свода ───────────────────────────────────
  const filteredSummary = useMemo(() => {
    return summary.filter((row) => {
      if (!matchesFilter(summaryFilters.values.sku, row.sku)) return false;
      if (!matchesFilter(summaryFilters.values.sku1c, row.sku1c)) return false;
      if (!matchesFilter(summaryFilters.values.name, row.name)) return false;
      if (!matchesFilter(summaryFilters.values.location, row.locationName))
        return false;
      if (!matchesFilter(summaryFilters.values.required, row.requiredQuantity))
        return false;
      if (
        !matchesFilter(summaryFilters.values.available, row.availableQuantity)
      )
        return false;

      // Статус — вычисляем на лету
      const statusLabel =
        row.availableQuantity >= row.requiredQuantity
          ? "Достаточно"
          : "Нехватка";
      if (!matchesFilter(summaryFilters.values.status, statusLabel))
        return false;

      return true;
    });
  }, [summary, summaryFilters.values]);

  // ── Сортировка свода ───────────────────────────────────
  const {
    sorted: sortedSummary,
    sort: sumSort,
    toggle: sumToggleSort,
  } = useSort(filteredSummary, (row, key) => {
    switch (key) {
      case "sku":
        return row.sku;
      case "sku1c":
        return row.sku1c;
      case "name":
        return row.name;
      case "location":
        return row.locationName;
      case "required":
        return row.requiredQuantity;
      case "available":
        return row.availableQuantity;
      case "status":
        return row.availableQuantity >= row.requiredQuantity
          ? "Достаточно"
          : "Нехватка";
      default:
        return "";
    }
  });

  // ── Опции для селектов ─────────────────────────────────
  const locationOptions = useMemo(
    () => locations.map((l) => l.name),
    [locations],
  );

  const robotDir = (key: string) =>
    robotSort.key === key ? robotSort.direction : null;
  const sumDir = (key: string) =>
    sumSort.key === key ? sumSort.direction : null;

  return (
    <AppLayout title="Роботы-доноры">
      {/* ═══ Тулбар ═══ */}
      <div className={styles.toolbar}>
        <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
          Всего роботов: {robots.length}
          {deficitRobotsCount > 0 &&
            ` · требуют запчастей: ${deficitRobotsCount}`}
        </span>

        {Object.keys(robotFilters.values).length > 0 && (
          <button
            className={styles.toolbarClearBtn}
            onClick={robotFilters.clearAll}
          >
            Сбросить фильтры роботов
          </button>
        )}

        <div className={styles.toolbarSpacer} />

        <Button variant="primary" onClick={() => setAddRobotOpen(true)}>
          + Добавить робота
        </Button>
      </div>

      {/* ═══ Таблица роботов ═══ */}
      <section className={styles.section}>
        <div className={styles.tableWrapper}>
          {robots.length === 0 ? (
            <div className={styles.empty}>
              Роботов пока нет. Добавьте первого.
            </div>
          ) : sortedRobots.length === 0 ? (
            <div className={styles.empty}>
              Нет роботов, подходящих под фильтры
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <Th
                    label="Номер робота"
                    sortKey="robotNumber"
                    sortDirection={robotDir("robotNumber")}
                    onSort={robotToggleSort}
                    filter={{ type: "text" }}
                    filterValue={robotFilters.values.robotNumber ?? null}
                    onFilterChange={(v) =>
                      robotFilters.setFilter("robotNumber", v)
                    }
                  />
                  <Th
                    label="Локация"
                    sortKey="location"
                    sortDirection={robotDir("location")}
                    onSort={robotToggleSort}
                    filter={{ type: "select", options: locationOptions }}
                    filterValue={robotFilters.values.location ?? null}
                    onFilterChange={(v) =>
                      robotFilters.setFilter("location", v)
                    }
                  />
                  <Th
                    label="Статус"
                    sortKey="status"
                    sortDirection={robotDir("status")}
                    onSort={robotToggleSort}
                    filter={{
                      type: "select",
                      options: ["Ждёт запчасти", "—"],
                    }}
                    filterValue={robotFilters.values.status ?? null}
                    onFilterChange={(v) => robotFilters.setFilter("status", v)}
                  />
                  <Th
                    label="Не хватает запчастей"
                    sortKey="partsCount"
                    sortDirection={robotDir("partsCount")}
                    onSort={robotToggleSort}
                    filter={{ type: "range" }}
                    filterValue={robotFilters.values.partsCount ?? null}
                    onFilterChange={(v) =>
                      robotFilters.setFilter("partsCount", v)
                    }
                  />
                  <th style={{ width: 200 }}></th>
                </tr>
              </thead>
              <tbody>
                {sortedRobots.map((robot) => {
                  const isOpen = expanded.has(robot.id);
                  const hasMissing = robot.missingParts.length > 0;
                  const waitingParts = robot.status === "WAITING_PARTS";

                  return (
                    <Fragment key={robot.id}>
                      <tr className={styles.robotRow}>
                        <td
                          style={{
                            color: "var(--color-text-muted)",
                            cursor: hasMissing ? "pointer" : "default",
                          }}
                          onClick={() => hasMissing && toggleRow(robot.id)}
                        >
                          {hasMissing ? (isOpen ? "▾" : "▸") : ""}
                        </td>
                        <td
                          className={styles.robotNumber}
                          onClick={() => hasMissing && toggleRow(robot.id)}
                          style={{
                            cursor: hasMissing ? "pointer" : "default",
                          }}
                        >
                          {robot.robotNumber}
                        </td>
                        <td>{locationName(robot.locationId)}</td>
                        <td>
                          {waitingParts ? (
                            <span className={`${ui.badge} ${ui.badgeYellow}`}>
                              Ждёт запчасти
                            </span>
                          ) : (
                            <span style={{ color: "var(--color-text-muted)" }}>
                              —
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`${styles.partsCount} ${
                              hasMissing ? styles.partsCountAlert : ""
                            }`}
                          >
                            {robot.missingParts.length}
                          </span>
                        </td>
                        <td>
                          <div className={styles.robotActions}>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setPartTarget(robot)}
                            >
                              + Запчасть
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => onRemoveRobot(robot)}
                            >
                              Удалить
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {isOpen && hasMissing && (
                        <tr>
                          <td className={styles.partsCell} colSpan={6}>
                            <div className={styles.partsInner}>
                              {robot.missingParts.map((part) => (
                                <div
                                  key={`${robot.id}-${part.sku}`}
                                  className={styles.partItem}
                                >
                                  <span className={styles.partSku}>
                                    {part.sku}
                                  </span>
                                  <span className={styles.partName}>
                                    {part.name}
                                  </span>
                                  <span className={styles.partQty}>
                                    не хватает: {part.quantity} шт.
                                  </span>
                                  <button
                                    className={styles.partRemove}
                                    title="Убрать запчасть"
                                    onClick={() =>
                                      dispatch(
                                        removeMissingPart({
                                          robotId: robot.id,
                                          sku: part.sku,
                                        }),
                                      )
                                    }
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <Button
                                size="sm"
                                variant="secondary"
                                className={styles.addPartBtn}
                                onClick={() => setPartTarget(robot)}
                              >
                                + Добавить ещё запчасть
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ═══ Свод по запчастям ═══ */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Свод по запчастям для доноров</h2>
          <span className={styles.sectionCount}>
            позиций: {sortedSummary.length}
            {sortedSummary.length !== summary.length && ` из ${summary.length}`}
          </span>

          {Object.keys(summaryFilters.values).length > 0 && (
            <button
              className={styles.toolbarClearBtn}
              onClick={summaryFilters.clearAll}
            >
              Сбросить фильтры свода
            </button>
          )}
        </div>

        <div className={styles.tableWrapper}>
          {summary.length === 0 ? (
            <div className={styles.empty}>
              Все роботы укомплектованы — запчастей не требуется
            </div>
          ) : sortedSummary.length === 0 ? (
            <div className={styles.empty}>
              Нет строк, подходящих под фильтры
            </div>
          ) : (
            <table className={styles.summaryTable}>
              <thead>
                <tr>
                  <Th
                    label="SKU"
                    sortKey="sku"
                    sortDirection={sumDir("sku")}
                    onSort={sumToggleSort}
                    filter={{ type: "text" }}
                    filterValue={summaryFilters.values.sku ?? null}
                    onFilterChange={(v) => summaryFilters.setFilter("sku", v)}
                  />
                  <Th
                    label="SKU 1C"
                    sortKey="sku1c"
                    sortDirection={sumDir("sku1c")}
                    onSort={sumToggleSort}
                    filter={{ type: "text" }}
                    filterValue={summaryFilters.values.sku1c ?? null}
                    onFilterChange={(v) => summaryFilters.setFilter("sku1c", v)}
                  />
                  <Th
                    label="Наименование"
                    sortKey="name"
                    sortDirection={sumDir("name")}
                    onSort={sumToggleSort}
                    filter={{ type: "text" }}
                    filterValue={summaryFilters.values.name ?? null}
                    onFilterChange={(v) => summaryFilters.setFilter("name", v)}
                  />
                  <Th
                    label="Локация"
                    sortKey="location"
                    sortDirection={sumDir("location")}
                    onSort={sumToggleSort}
                    filter={{ type: "select", options: locationOptions }}
                    filterValue={summaryFilters.values.location ?? null}
                    onFilterChange={(v) =>
                      summaryFilters.setFilter("location", v)
                    }
                  />
                  <Th
                    label="Требуется"
                    sortKey="required"
                    sortDirection={sumDir("required")}
                    onSort={sumToggleSort}
                    filter={{ type: "range" }}
                    filterValue={summaryFilters.values.required ?? null}
                    onFilterChange={(v) =>
                      summaryFilters.setFilter("required", v)
                    }
                  />
                  <Th
                    label="Доступно"
                    sortKey="available"
                    sortDirection={sumDir("available")}
                    onSort={sumToggleSort}
                    filter={{ type: "range" }}
                    filterValue={summaryFilters.values.available ?? null}
                    onFilterChange={(v) =>
                      summaryFilters.setFilter("available", v)
                    }
                  />
                  <Th
                    label="Статус"
                    sortKey="status"
                    sortDirection={sumDir("status")}
                    onSort={sumToggleSort}
                    filter={{
                      type: "select",
                      options: ["Достаточно", "Нехватка"],
                    }}
                    filterValue={summaryFilters.values.status ?? null}
                    onFilterChange={(v) =>
                      summaryFilters.setFilter("status", v)
                    }
                  />
                </tr>
              </thead>
              <tbody>
                {sortedSummary.map((row) => {
                  const deficit = row.availableQuantity < row.requiredQuantity;
                  const shortage = row.requiredQuantity - row.availableQuantity;

                  return (
                    <tr key={`${row.sku}-${row.locationId}`}>
                      <td className={styles.sku}>{row.sku}</td>
                      <td className={styles.sku}>{row.sku1c || "—"}</td>
                      <td style={{ fontWeight: 500 }}>{row.name}</td>
                      <td>{row.locationName}</td>
                      <td>
                        <span className={styles.qtyLow}>
                          {row.requiredQuantity}
                        </span>
                      </td>
                      <td className={deficit ? styles.qtyLow : styles.qtyOk}>
                        {row.availableQuantity}
                      </td>
                      <td>
                        {deficit ? (
                          <span className={`${ui.badge} ${ui.badgeRed}`}>
                            Нехватка: {shortage} шт.
                          </span>
                        ) : (
                          <span className={`${ui.badge} ${ui.badgeGreen}`}>
                            Достаточно
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ═══ Модалки ═══ */}
      <AddRobotModal
        key={addRobotOpen ? "add-robot-open" : "add-robot-closed"}
        open={addRobotOpen}
        onClose={() => setAddRobotOpen(false)}
      />
      <AddMissingPartModal
        key={partTarget?.id ?? "no-part-target"}
        open={!!partTarget}
        robot={partTarget}
        onClose={() => setPartTarget(null)}
      />
    </AppLayout>
  );
}

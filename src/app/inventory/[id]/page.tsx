"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { useAppSelector } from "@/store/hooks";
import { hasPermission } from "@/utils/roles";
import { formatDateTime, signed } from "@/utils/format";
import { MoveItemModal } from "@/components/inventory/MoveItemModal";
import styles from "./item.module.css";
import ui from "@/components/ui/ui.module.css";

// ─────────────────────────────────────────────────────────
// Основной контент карточки — использует useParams
// ─────────────────────────────────────────────────────────
function ItemPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const itemId = Number(params.id);

  const item = useAppSelector((s) =>
    s.inventory.items.find((i) => i.id === itemId),
  );
  const locations = useAppSelector((s) => s.locations.items);
  const history = useAppSelector((s) =>
    s.inventory.history.filter((h) => h.itemId === itemId),
  );
  const user = useAppSelector((s) => s.auth.currentUser);

  const [moveOpen, setMoveOpen] = useState(false);

  const location = useMemo(
    () => locations.find((l) => l.id === item?.locationId),
    [locations, item],
  );

  if (!item) {
    return (
      <AppLayout title="Товар не найден">
        <button
          className={styles.back}
          onClick={() => router.push("/inventory")}
        >
          ← Назад к товарам
        </button>
        <div className={ui.card}>Товар с id={itemId} не найден</div>
      </AppLayout>
    );
  }

  const deficit = item.quantity < item.needForDonors;
  const qtyClass = deficit
    ? styles.qtyLow
    : item.quantity === 0
      ? styles.qtyZero
      : styles.qtyOk;

  return (
    <AppLayout title={`Товар: ${item.name}`}>
      <button className={styles.back} onClick={() => router.push("/inventory")}>
        ← Назад к товарам
      </button>

      <div className={styles.grid}>
        {/* Левая колонка — фото и ключевые цифры */}
        <div className={ui.card}>
          <div className={styles.bigPhoto}>
            {item.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.photoUrl} alt={item.name} />
            ) : (
              "📦"
            )}
          </div>

          <div className={styles.qtyRow}>
            <span className={`${styles.qtyValue} ${qtyClass}`}>
              {item.quantity}
            </span>
            <span className={styles.qtyLabel}>
              на локации «{location?.name ?? "—"}»
            </span>
          </div>

          {deficit && (
            <div style={{ marginTop: 10 }}>
              <span className={`${ui.badge} ${ui.badgeRed}`}>
                Дефицит: не хватает {item.needForDonors - item.quantity} шт.
              </span>
            </div>
          )}

          {hasPermission(user?.role ?? null, "MOVE_ITEM") && (
            <Button
              variant="primary"
              onClick={() => setMoveOpen(true)}
              style={{ width: "100%", marginTop: 16 }}
            >
              Переместить
            </Button>
          )}
        </div>

        {/* Правая колонка — детали */}
        <div className={ui.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Информация о товаре</h2>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Наименование</span>
            <span className={styles.infoValue}>{item.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>SKU</span>
            <span className={styles.infoValue}>{item.sku}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>SKU 1C</span>
            <span className={styles.infoValue}>{item.sku1c || "—"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Место хранения</span>
            <span className={styles.infoValue}>{item.storagePlace || "—"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Локация</span>
            <span className={styles.infoValue}>
              {location?.name} ({location?.responsible})
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Нужно на доноров</span>
            <span className={styles.infoValue}>{item.needForDonors} шт.</span>
          </div>
        </div>
      </div>

      {/* История изменений */}
      <div className={ui.card} style={{ marginTop: 20 }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>История изменений</h2>
        </div>

        {history.length === 0 ? (
          <div style={{ color: "var(--color-text-muted)", padding: "12px 0" }}>
            Пока нет изменений по этому товару.
          </div>
        ) : (
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Δ</th>
                <th>Было → Стало</th>
                <th>Причина</th>
                <th>Комментарий</th>
                <th>Пользователь</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{formatDateTime(h.createdAt)}</td>
                  <td
                    className={
                      h.change >= 0 ? styles.changePlus : styles.changeMinus
                    }
                  >
                    {signed(h.change)}
                  </td>
                  <td>
                    {h.quantityBefore} → {h.quantityAfter}
                  </td>
                  <td>{h.reason}</td>
                  <td>{h.comment ?? "—"}</td>
                  <td>{h.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <MoveItemModal
        key={item.id}
        open={moveOpen}
        item={item}
        onClose={() => setMoveOpen(false)}
      />
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────
// Страница-обёртка: Suspense вокруг контента
// ─────────────────────────────────────────────────────────
export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 24, color: "var(--color-text-muted)" }}>
          Загрузка товара…
        </div>
      }
    >
      <ItemPageContent />
    </Suspense>
  );
}

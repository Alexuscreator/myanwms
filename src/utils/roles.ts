import { Role } from "@/types";

export const ROLE_LABELS: Record<Role, string> = {
  [Role.GOD]: "Бог",
  [Role.LEAD_INVENTORY_MANAGER]: "Ведущий менеджер по товарному запасу",
  [Role.SENIOR_INVENTORY_MANAGER]: "Старший менеджер по товарному запасу",
  [Role.INVENTORY_MANAGER]: "Менеджер по товарному запасу",
  [Role.WAREHOUSE_HEAD]: "Руководитель склада",
  [Role.SENIOR_WAREHOUSE_SPECIALIST]: "Старший специалист склада",
  [Role.WAREHOUSE_SPECIALIST]: "Специалист склада",
}; // лэйблы ролей

export const PERMISSIONS = {
  // у кого есть права создавать и удалять пользователей
  CREATE_USER: [Role.GOD],
  DELETE_USER: [Role.GOD],

  VIEW_INVENTORY: [
    //просмотр таблиц
    Role.GOD,
    Role.LEAD_INVENTORY_MANAGER,
    Role.SENIOR_INVENTORY_MANAGER,
    Role.INVENTORY_MANAGER,
    Role.WAREHOUSE_HEAD,
    Role.SENIOR_WAREHOUSE_SPECIALIST,
    Role.WAREHOUSE_SPECIALIST,
  ],
  VIEW_ROBOTS: [
    Role.GOD,
    Role.LEAD_INVENTORY_MANAGER,
    Role.SENIOR_INVENTORY_MANAGER,
    Role.INVENTORY_MANAGER,
    Role.WAREHOUSE_HEAD,
    Role.SENIOR_WAREHOUSE_SPECIALIST,
    Role.WAREHOUSE_SPECIALIST,
  ],

  //добавление частей
  ADD_ITEM: [
    Role.GOD,
    Role.LEAD_INVENTORY_MANAGER,
    Role.SENIOR_INVENTORY_MANAGER,
    Role.INVENTORY_MANAGER,
  ],

  // Перемещение товара
  MOVE_ITEM: [
    Role.GOD,
    Role.LEAD_INVENTORY_MANAGER,
    Role.SENIOR_INVENTORY_MANAGER,
    Role.INVENTORY_MANAGER,
    Role.WAREHOUSE_HEAD,
    Role.SENIOR_WAREHOUSE_SPECIALIST,
  ],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(
  role: Role | null,
  permission: Permission,
): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

import { Role, User } from "@/types";

export const mockUsers: User[] = [
  {
    id: 1,
    login: "god",
    password: "god",
    fullName: "СОЗДАТЕЛЬ",
    role: Role.GOD,
    createdAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: 2,
    login: "lead",
    password: "lead",
    fullName: "Петров Пётр",
    role: Role.LEAD_INVENTORY_MANAGER,
    createdAt: new Date("2026-01-02").toISOString(),
  },
  {
    id: 3,
    login: "manager",
    password: "manager",
    fullName: "Сидоров Сидор",
    role: Role.INVENTORY_MANAGER,
    createdAt: new Date("2026-01-03").toISOString(),
  },
  {
    id: 4,
    login: "warehouse",
    password: "warehouse",
    fullName: "Кузнецов Кузьма",
    role: Role.WAREHOUSE_SPECIALIST,
    createdAt: new Date("2026-01-04").toISOString(),
  },
];

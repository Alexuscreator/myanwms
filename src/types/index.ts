export enum Role {
  GOD = "GOD", //всё может и видит
  LEAD_INVENTORY_MANAGER = "LEAD_INVENTORY_MANAGER", // вед менеджер по товарному запасу
  SENIOR_INVENTORY_MANAGER = "SENIOR_INVENTORY_MANAGER", // Старший менеджер по товарному запасу
  INVENTORY_MANAGER = "INVENTORY_MANAGER", // Менеджер по товарному запасу
  WAREHOUSE_HEAD = "WAREHOUSE_HEAD", // Руководитель склада
  SENIOR_WAREHOUSE_SPECIALIST = "SENIOR_WAREHOUSE_SPECIALIST", // Старший специалист склада
  WAREHOUSE_SPECIALIST = "WAREHOUSE_SPECIALIST", // Специалист склада
}

//пользователи
export interface User {
  id: number;
  login: string;
  password?: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface Location {
  id: number;
  name: string;
  responsible: string; //ответственный
}

export interface Item {
  id: number;
  locationId: number;
  name: string;
  sku: string;
  sku1c: string;
  quantity: number;
  photoUrl?: string;
  storagePlace: string; //где на складе
  needForDonors: number; //сколько для доноров
}

//записи изменения кол-ва частей
export interface InventoryHistoryRecord {
  id: number;
  itemId: number;
  itemName: string;
  sku: string;
  sku1c: string;
  locationId: number;
  locationName: string;
  change: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: "MOVE" | "ADD" | "MANUAL_EDIT" | "DONOR_USE";
  comment?: string;
  userId: number;
  userName: string;
  createdAt: string;
}

//что не хватает донору
export interface RobotMissingPart {
  sku: string;
  sku1c: string;
  name: string;
  quantity: number;
}

//Робот-донор
export interface RobotDONOR {
  id: number;
  robotNumber: string; // номер робота
  locationId: number; // на какой локации стоит
  missingParts: RobotMissingPart[];
  status?: "WAITING_PARTS";
}

// сколько, чего, куда нужно для доноров (свод)
export interface DonorPartsSummary {
  sku: string;
  sku1c: string;
  name: string;
  locationId: number;
  locationName: string;
  requiredQuantity: number;
  availableQuantity: number;
}

import { RobotDONOR } from "@/types";

export const mockRobots: RobotDONOR[] = [
  {
    id: 1,
    robotNumber: "R-001",
    locationId: 1,
    status: "WAITING_PARTS",
    missingParts: [
      { sku: "SKU-1002", sku1c: "1C-000002", name: "Лидар", quantity: 2 },
      {
        sku: "SKU-2001",
        sku1c: "1C-000010",
        name: "Аккумулятор",
        quantity: 1,
      },
    ],
  },
  {
    id: 2,
    robotNumber: "R-002",
    locationId: 1,
    status: "WAITING_PARTS",
    missingParts: [
      { sku: "SKU-1002", sku1c: "1C-000002", name: "Лидар", quantity: 1 },
    ],
  },
  {
    id: 3,
    robotNumber: "R-003",
    locationId: 2,
    status: "WAITING_PARTS",
    missingParts: [
      {
        sku: "SKU-1001",
        sku1c: "1C-000001",
        name: "свет правый в сборе",
        quantity: 4,
      },
    ],
  },
];

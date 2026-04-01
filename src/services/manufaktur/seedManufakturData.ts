
import { BOM, BOMItem } from "@/types/manufaktur";
import { getFromLocalStorage, saveToLocalStorage } from "@/utils/localStorage";
import { v4 as uuidv4 } from "uuid";

const SEED_KEY = "manufaktur_seed_v1_done";
const BOM_KEY = "manufaktur_bom";
const WO_KEY = "manufaktur_work_orders";

export function seedManufakturData(): void {
  if (getFromLocalStorage<boolean>(SEED_KEY, false)) {
    console.log("✅ Manufaktur seed data already applied");
    return;
  }

  console.log("🌱 Seeding Manufaktur demo data...");

  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const ago = (days: number) => new Date(now.getTime() - days * 86400000);

  // ===== BOM 1: Roti Tawar =====
  const bom1Id = uuidv4();
  const bom1Items: BOMItem[] = [
    { id: uuidv4(), bomId: bom1Id, materialName: "Tepung Terigu", materialCode: "MAT-001", quantity: 5, unit: "kg", unitCost: 12000, totalCost: 60000, notes: "Protein tinggi" },
    { id: uuidv4(), bomId: bom1Id, materialName: "Gula Pasir", materialCode: "MAT-002", quantity: 0.5, unit: "kg", unitCost: 15000, totalCost: 7500 },
    { id: uuidv4(), bomId: bom1Id, materialName: "Ragi Instan", materialCode: "MAT-003", quantity: 50, unit: "gram", unitCost: 200, totalCost: 10000 },
    { id: uuidv4(), bomId: bom1Id, materialName: "Mentega", materialCode: "MAT-004", quantity: 0.3, unit: "kg", unitCost: 40000, totalCost: 12000 },
    { id: uuidv4(), bomId: bom1Id, materialName: "Susu Bubuk", materialCode: "MAT-005", quantity: 100, unit: "gram", unitCost: 100, totalCost: 10000 },
  ];
  const bom1MatCost = bom1Items.reduce((s, i) => s + i.totalCost, 0);
  const bom1: BOM = {
    id: bom1Id, code: "BOM-001", productName: "Roti Tawar", productCode: "PRD-001",
    description: "Roti tawar standar untuk produksi harian", category: "Makanan & Minuman",
    items: bom1Items, totalMaterialCost: bom1MatCost, overheadCost: 15000, laborCost: 25000,
    totalCost: bom1MatCost + 15000 + 25000, outputQuantity: 10, outputUnit: "pcs",
    status: "Active", createdAt: ago(30).toISOString(), updatedAt: ago(5).toISOString(),
  };

  // ===== BOM 2: Kue Lapis =====
  const bom2Id = uuidv4();
  const bom2Items: BOMItem[] = [
    { id: uuidv4(), bomId: bom2Id, materialName: "Tepung Beras", materialCode: "MAT-006", quantity: 2, unit: "kg", unitCost: 18000, totalCost: 36000 },
    { id: uuidv4(), bomId: bom2Id, materialName: "Santan Kelapa", materialCode: "MAT-007", quantity: 2, unit: "liter", unitCost: 20000, totalCost: 40000 },
    { id: uuidv4(), bomId: bom2Id, materialName: "Gula Pasir", materialCode: "MAT-002", quantity: 1, unit: "kg", unitCost: 15000, totalCost: 15000 },
    { id: uuidv4(), bomId: bom2Id, materialName: "Pewarna Makanan", materialCode: "MAT-008", quantity: 10, unit: "ml", unitCost: 500, totalCost: 5000 },
  ];
  const bom2MatCost = bom2Items.reduce((s, i) => s + i.totalCost, 0);
  const bom2: BOM = {
    id: bom2Id, code: "BOM-002", productName: "Kue Lapis", productCode: "PRD-002",
    description: "Kue lapis tradisional 3 warna", category: "Makanan & Minuman",
    items: bom2Items, totalMaterialCost: bom2MatCost, overheadCost: 10000, laborCost: 30000,
    totalCost: bom2MatCost + 10000 + 30000, outputQuantity: 20, outputUnit: "pcs",
    status: "Active", createdAt: ago(25).toISOString(), updatedAt: ago(3).toISOString(),
  };

  // ===== BOM 3: Meja Kayu (Draft) =====
  const bom3Id = uuidv4();
  const bom3Items: BOMItem[] = [
    { id: uuidv4(), bomId: bom3Id, materialName: "Kayu Jati", materialCode: "MAT-009", quantity: 3, unit: "batang", unitCost: 150000, totalCost: 450000 },
    { id: uuidv4(), bomId: bom3Id, materialName: "Paku", materialCode: "MAT-010", quantity: 1, unit: "pack", unitCost: 25000, totalCost: 25000 },
    { id: uuidv4(), bomId: bom3Id, materialName: "Lem Kayu", materialCode: "MAT-011", quantity: 2, unit: "liter", unitCost: 35000, totalCost: 70000 },
    { id: uuidv4(), bomId: bom3Id, materialName: "Cat Pernis", materialCode: "MAT-012", quantity: 1, unit: "liter", unitCost: 85000, totalCost: 85000 },
    { id: uuidv4(), bomId: bom3Id, materialName: "Amplas", materialCode: "MAT-013", quantity: 5, unit: "lembar", unitCost: 5000, totalCost: 25000 },
  ];
  const bom3MatCost = bom3Items.reduce((s, i) => s + i.totalCost, 0);
  const bom3: BOM = {
    id: bom3Id, code: "BOM-003", productName: "Meja Kayu Jati", productCode: "PRD-003",
    description: "Meja kayu jati ukuran 120x60cm", category: "Furnitur",
    items: bom3Items, totalMaterialCost: bom3MatCost, overheadCost: 50000, laborCost: 200000,
    totalCost: bom3MatCost + 50000 + 200000, outputQuantity: 1, outputUnit: "pcs",
    status: "Draft", createdAt: ago(7).toISOString(), updatedAt: ago(7).toISOString(),
  };

  const bomList = [bom1, bom2, bom3];
  saveToLocalStorage(BOM_KEY, bomList);
  console.log(`✅ 3 BOM created: Roti Tawar, Kue Lapis, Meja Kayu Jati`);

  // ===== Work Orders =====
  const wo1 = {
    id: uuidv4(), code: "WO-001", bomId: bom1.id, bomCode: bom1.code,
    productName: bom1.productName, quantity: 50, unit: bom1.outputUnit,
    status: "Completed" as const, priority: "High" as const,
    startDate: fmt(ago(20)), dueDate: fmt(ago(10)), completedDate: fmt(ago(12)),
    assignedTo: "Pak Budi", notes: "Pesanan untuk acara koperasi",
    estimatedCost: bom1.totalCost * 50, actualCost: bom1.totalCost * 50 + 50000,
    createdAt: ago(20).toISOString(), updatedAt: ago(12).toISOString(),
  };

  const wo2 = {
    id: uuidv4(), code: "WO-002", bomId: bom2.id, bomCode: bom2.code,
    productName: bom2.productName, quantity: 100, unit: bom2.outputUnit,
    status: "In Progress" as const, priority: "Medium" as const,
    startDate: fmt(ago(5)), dueDate: fmt(new Date(now.getTime() + 5 * 86400000)),
    assignedTo: "Bu Sari", notes: "Produksi mingguan reguler",
    estimatedCost: bom2.totalCost * 100,
    createdAt: ago(5).toISOString(), updatedAt: ago(1).toISOString(),
  };

  const wo3 = {
    id: uuidv4(), code: "WO-003", bomId: bom1.id, bomCode: bom1.code,
    productName: bom1.productName, quantity: 30, unit: bom1.outputUnit,
    status: "Draft" as const, priority: "Low" as const,
    startDate: fmt(new Date(now.getTime() + 3 * 86400000)),
    dueDate: fmt(new Date(now.getTime() + 10 * 86400000)),
    assignedTo: "", notes: "Rencana produksi minggu depan",
    estimatedCost: bom1.totalCost * 30,
    createdAt: ago(2).toISOString(), updatedAt: ago(2).toISOString(),
  };

  const wo4 = {
    id: uuidv4(), code: "WO-004", bomId: bom2.id, bomCode: bom2.code,
    productName: bom2.productName, quantity: 200, unit: bom2.outputUnit,
    status: "Completed" as const, priority: "Urgent" as const,
    startDate: fmt(ago(15)), dueDate: fmt(ago(8)), completedDate: fmt(ago(9)),
    assignedTo: "Bu Sari", notes: "Pesanan khusus event desa",
    estimatedCost: bom2.totalCost * 200, actualCost: bom2.totalCost * 200 - 100000,
    createdAt: ago(15).toISOString(), updatedAt: ago(9).toISOString(),
  };

  const woList = [wo1, wo2, wo3, wo4];
  saveToLocalStorage(WO_KEY, woList);
  console.log(`✅ 4 Work Orders created (1 Draft, 1 In Progress, 2 Completed)`);

  saveToLocalStorage(SEED_KEY, true);
  console.log("✅ Manufaktur seed data complete!");
}

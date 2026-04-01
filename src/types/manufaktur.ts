
export interface BOMItem {
  id: string;
  bomId: string;
  materialName: string;
  materialCode: string;
  quantity: number;
  unit: string; // pcs, kg, liter, meter, etc.
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface BOM {
  id: string;
  code: string; // BOM-001, BOM-002, etc.
  productName: string;
  productCode: string;
  description?: string;
  category: string;
  items: BOMItem[];
  totalMaterialCost: number;
  overheadCost: number;
  laborCost: number;
  totalCost: number;
  outputQuantity: number;
  outputUnit: string;
  status: 'Draft' | 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export const BOM_CATEGORIES = [
  'Makanan & Minuman',
  'Elektronik',
  'Tekstil',
  'Furnitur',
  'Kerajinan',
  'Kimia',
  'Lainnya',
];

export const MATERIAL_UNITS = [
  'pcs', 'kg', 'gram', 'liter', 'ml', 'meter', 'cm', 'lembar', 'batang', 'set', 'pack', 'roll',
];

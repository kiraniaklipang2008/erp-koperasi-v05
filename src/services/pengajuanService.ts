import { Pengajuan, PersyaratanDokumen } from "@/types";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/localStorage";
import { getAnggotaById } from "./anggotaService";
import { createTransaksi } from "./transaksiService";
import { calculateTotalSimpanan } from "./transaksi/financialOperations";
import { calculateLoanDetails, generateLoanDescription } from "../utils/loanCalculations";
import { ensureAutoDeductionCategories } from "./keuangan/baseService";
import { centralizedSync } from "./sync/centralizedSyncService";

const PENGAJUAN_KEY = "koperasi_pengajuan";

// Empty initial data as requested
const initialPengajuan: Pengajuan[] = [];

/**
 * Get all pengajuan from local storage
 */
export function getPengajuanList(): Pengajuan[] {
  return getFromLocalStorage<Pengajuan[]>(PENGAJUAN_KEY, initialPengajuan);
}

/**
 * Get pengajuan by ID
 */
export function getPengajuanById(id: string): Pengajuan | undefined {
  const pengajuanList = getPengajuanList();
  return pengajuanList.find(pengajuan => pengajuan.id === id);
}

/**
 * Get pengajuan by anggota ID
 */
export function getPengajuanByAnggotaId(anggotaId: string): Pengajuan[] {
  const pengajuanList = getPengajuanList();
  return pengajuanList.filter(pengajuan => pengajuan.anggotaId === anggotaId);
}

/**
 * Generate a new pengajuan ID
 */
export function generatePengajuanId(): string {
  const pengajuanList = getPengajuanList();
  const lastId = pengajuanList.length > 0 
    ? parseInt(pengajuanList[pengajuanList.length - 1].id.replace("PG", "")) 
    : 0;
  const newId = `PG${String(lastId + 1).padStart(4, "0")}`;
  return newId;
}

/**
 * Create a new pengajuan
 */
export function createPengajuan(
  pengajuan: Omit<Pengajuan, "id" | "anggotaNama" | "createdAt" | "updatedAt"> & { dokumen?: PersyaratanDokumen[] }
): Pengajuan | null {
  const anggota = getAnggotaById(pengajuan.anggotaId);
  if (!anggota) return null;
  
  const pengajuanList = getPengajuanList();
  const now = new Date().toISOString();
  
  const newPengajuan: Pengajuan = {
    ...pengajuan,
    id: generatePengajuanId(),
    anggotaNama: anggota.nama,
    createdAt: now,
    updatedAt: now,
  };
  
  pengajuanList.push(newPengajuan);
  saveToLocalStorage(PENGAJUAN_KEY, pengajuanList);
  
  return newPengajuan;
}

/**
 * Update an existing pengajuan
 */
export function updatePengajuan(
  id: string, 
  pengajuan: Partial<Pengajuan & { dokumen?: PersyaratanDokumen[] }>
): Pengajuan | null {
  const pengajuanList = getPengajuanList();
  const index = pengajuanList.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  // If anggotaId is being updated, we need to update anggotaNama as well
  if (pengajuan.anggotaId) {
    const anggota = getAnggotaById(pengajuan.anggotaId);
    if (!anggota) return null;
    pengajuan.anggotaNama = anggota.nama;
  }
  
  pengajuanList[index] = {
    ...pengajuanList[index],
    ...pengajuan,
    updatedAt: new Date().toISOString(),
  };
  
  saveToLocalStorage(PENGAJUAN_KEY, pengajuanList);
  return pengajuanList[index];
}

/**
 * Delete a pengajuan by ID
 */
export function deletePengajuan(id: string): boolean {
  const pengajuanList = getPengajuanList();
  const filteredList = pengajuanList.filter(pengajuan => pengajuan.id !== id);
  
  if (filteredList.length === pengajuanList.length) return false;
  
  saveToLocalStorage(PENGAJUAN_KEY, filteredList);
  return true;
}

/**
 * Approve a pengajuan dan convert ke transaction dengan centralized sync
 */
export function approvePengajuan(id: string): boolean {
  const pengajuan = getPengajuanById(id);
  if (!pengajuan || pengajuan.status !== "Menunggu") return false;
  
  // Special validation for withdrawal applications
  if (pengajuan.jenis === "Penarikan") {
    const availableBalance = calculateTotalSimpanan(pengajuan.anggotaId);
    if (pengajuan.jumlah > availableBalance) {
      console.error(`Insufficient balance for withdrawal. Requested: ${pengajuan.jumlah}, Available: ${availableBalance}`);
      return false;
    }
  }
  
  // Ensure auto-deduction categories exist before processing loans
  if (pengajuan.jenis === "Pinjam") {
    ensureAutoDeductionCategories();
  }
  
  // Update the pengajuan status
  const updatedPengajuan = updatePengajuan(id, { status: "Disetujui" });
  if (!updatedPengajuan) return false;
  
  // Prepare keterangan with detailed loan information for Pinjam type
  let finalKeterangan = `Dari Pengajuan #${pengajuan.id}: ${pengajuan.keterangan || ""}`.trim();
  
  if (pengajuan.jenis === "Pinjam") {
    // Use tenor from pengajuan if available, otherwise use default
    const tenor = (pengajuan as any).tenor;
    const loanCalculation = calculateLoanDetails(pengajuan.kategori, pengajuan.jumlah, tenor);
    finalKeterangan = generateLoanDescription(loanCalculation, finalKeterangan);
  }
  
  // Create a transaction based on the approved pengajuan
  // Auto deductions will be processed automatically in createTransaksi for loans
  const transaction = createTransaksi({
    tanggal: pengajuan.tanggal,
    anggotaId: pengajuan.anggotaId,
    jenis: pengajuan.jenis,
    jumlah: pengajuan.jumlah,
    kategori: pengajuan.kategori,
    keterangan: finalKeterangan,
    status: "Sukses"
  });
  
  if (transaction) {
    // Centralized sync untuk approved pengajuan
    console.log(`🔄 Triggering centralized sync for approved pengajuan ${id}`);
    const syncResult = centralizedSync.syncPengajuan(updatedPengajuan);
    
    if (syncResult.success) {
      console.log(`✅ Centralized pengajuan sync completed for ${id}: ${syncResult.message}`);
    } else {
      console.warn(`⚠️ Centralized pengajuan sync warning for ${id}: ${syncResult.message}`);
    }
    
    // Emit pengajuan approved event
    window.dispatchEvent(new CustomEvent('pengajuan-approved', {
      detail: { 
        pengajuan: updatedPengajuan,
        transaction: transaction,
        timestamp: new Date().toISOString()
      }
    }));
    
    console.log(`✅ Pengajuan ${id} approved and synced to centralized accounting system`);
  }
  
  return !!transaction;
}

/**
 * Reject a pengajuan with real-time sync notification
 */
export function rejectPengajuan(id: string): boolean {
  const pengajuan = getPengajuanById(id);
  if (!pengajuan || pengajuan.status !== "Menunggu") return false;
  
  // Update the pengajuan status
  const updatedPengajuan = updatePengajuan(id, { status: "Ditolak" });
  
  if (updatedPengajuan) {
    // Emit pengajuan rejected event
    window.dispatchEvent(new CustomEvent('pengajuan-rejected', {
      detail: { 
        pengajuan: updatedPengajuan,
        timestamp: new Date().toISOString()
      }
    }));
    
    console.log(`❌ Pengajuan ${id} rejected`);
  }
  
  return !!updatedPengajuan;
}

/**
 * Get pengajuan by status
 */
export function getPengajuanByStatus(status: "Menunggu" | "Disetujui" | "Ditolak"): Pengajuan[] {
  const pengajuanList = getPengajuanList();
  return pengajuanList.filter(pengajuan => pengajuan.status === status);
}

/**
 * Get pengajuan by jenis
 */
export function getPengajuanByJenis(jenis: "Simpan" | "Pinjam" | "Penarikan"): Pengajuan[] {
  const pengajuanList = getPengajuanList();
  return pengajuanList.filter(pengajuan => pengajuan.jenis === jenis);
}

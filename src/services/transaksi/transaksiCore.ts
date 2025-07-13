import { Transaksi } from "@/types";
import { getFromLocalStorage, saveToLocalStorage } from "@/utils/localStorage";
import { initialTransaksi } from "./initialData";
import { generateTransaksiId } from "./idGenerator";
import { getAnggotaById } from "@/services/anggotaService";
import { getJenisByType } from "@/services/jenisService";
import { syncTransactionToAccounting } from "@/services/akuntansi/accountingSyncService";

const TRANSAKSI_KEY = "koperasi_transaksi";

/**
 * Get all transaksi from local storage
 */
export function getAllTransaksi(): Transaksi[] {
  return getFromLocalStorage<Transaksi[]>(TRANSAKSI_KEY, initialTransaksi);
}

/**
 * Get transaksi by anggota ID
 */
export function getTransaksiByAnggotaId(anggotaId: string): Transaksi[] {
  const transaksiList = getAllTransaksi();
  return transaksiList.filter(
    (transaksi) => transaksi.anggotaId === anggotaId
  );
}

/**
 * Get transaksi by ID
 */
export function getTransaksiById(id: string): Transaksi | undefined {
  const transaksiList = getAllTransaksi();
  return transaksiList.find((transaksi) => transaksi.id === id);
}

/**
 * Get transaksi by type and category
 */
export function getTransaksiByTypeAndCategory(
  jenis: "Simpan" | "Pinjam" | "Angsuran", 
  kategori?: string
): Transaksi[] {
  const transaksiList = getAllTransaksi();
  if (kategori) {
    return transaksiList.filter(t => t.jenis === jenis && t.kategori === kategori);
  } else {
    return transaksiList.filter(t => t.jenis === jenis);
  }
}

/**
 * Get all active kategori names by jenis
 */
export function getAvailableKategori(jenis: "Simpan" | "Pinjam"): string[] {
  const jenisTransaksi = jenis === "Simpan" ? "Simpanan" : "Pinjaman";
  const jenisList = getJenisByType(jenisTransaksi);
  return jenisList
    .filter(j => j.isActive)
    .map(j => j.nama);
}

/**
 * Validate if a kategori is valid for a specific jenis
 */
export function isValidKategori(jenis: "Simpan" | "Pinjam", kategori: string): boolean {
  const availableKategori = getAvailableKategori(jenis);
  return availableKategori.includes(kategori);
}

/**
 * Create a new transaksi with automatic accounting sync
 */
export function createTransaksi(data: Partial<Transaksi>): Transaksi | null {
  try {
    const transaksiList = getAllTransaksi();
    const newId = generateTransaksiId();
    const now = new Date().toISOString();
    
    // If anggotaId is provided but anggotaNama is not, try to get anggota name
    let anggotaNama = data.anggotaNama || "";
    if (data.anggotaId && !data.anggotaNama) {
      const anggota = getAnggotaById(data.anggotaId);
      if (anggota) {
        anggotaNama = anggota.nama;
      }
    }
    
    // Validate kategori if provided
    if (data.jenis && data.kategori) {
      // Check if kategori is valid for the given jenis
      if (!isValidKategori(data.jenis as "Simpan" | "Pinjam", data.kategori)) {
        console.warn(`Kategori '${data.kategori}' is not valid for jenis ${data.jenis}`);
        // We'll continue anyway but with warning
      }
    }
    
    const newTransaksi: Transaksi = {
      id: newId,
      tanggal: data.tanggal || new Date().toISOString().split('T')[0],
      anggotaId: data.anggotaId || "",
      anggotaNama: anggotaNama,
      jenis: data.jenis || "Simpan",
      kategori: data.kategori || undefined,
      jumlah: data.jumlah || 0,
      keterangan: data.keterangan || "",
      status: data.status || "Sukses",
      createdAt: now,
      updatedAt: now,
    };
    
    transaksiList.push(newTransaksi);
    saveToLocalStorage(TRANSAKSI_KEY, transaksiList);
    
    // Auto-sync to accounting system if status is Sukses
    if (newTransaksi.status === "Sukses") {
      try {
        const journalEntry = syncTransactionToAccounting(newTransaksi);
        if (journalEntry) {
          console.log(`✅ Transaction ${newTransaksi.id} (${newTransaksi.jenis}) automatically synced to accounting (Journal: ${journalEntry.nomorJurnal})`);
        }
      } catch (syncError) {
        console.error("❌ Failed to sync transaction to accounting:", syncError);
        // Don't fail the transaction creation if accounting sync fails
      }
    }
    
    return newTransaksi;
  } catch (error) {
    console.error("Error creating transaksi:", error);
    return null;
  }
}

import { Anggota, AnggotaKeluarga } from "@/types/anggota";
import { getFromLocalStorage, saveToLocalStorage } from "@/utils/localStorage";
import { getAllUnitKerja, syncUnitKerjaWithAnggota } from "./unitKerjaService";
import { logAuditEntry } from "./auditService";

const ANGGOTA_KEY = "koperasi_anggota";

// Initial sample data with the specified dummy data
const initialAnggota: Anggota[] = [
  { 
    id: "AG0001", 
    nama: "MARIYEM", 
    nip: "197201011998031001",
    alamat: "DESA JATILOR",
    noHp: "0812345678",
    jenisKelamin: "P",
    agama: "ISLAM",
    status: "active",
    unitKerja: "SDN Jatilor 01",
    tanggalBergabung: "2023-01-15",
    tanggalRegistrasi: "2023",
    foto: null,
    email: "mariyem@example.com",
    dokumen: [],
    keluarga: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: "AG0002", 
    nama: "MASKUN ROZAK", 
    nip: "198201011998031001",
    alamat: "DESA BRINGIN",
    noHp: "0823456789",
    jenisKelamin: "L",
    agama: "ISLAM",
    status: "active",
    unitKerja: "SDN Bringin",
    tanggalBergabung: "2023-02-20",
    tanggalRegistrasi: "2023",
    foto: null,
    email: "maskun.rozak@example.com",
    dokumen: [],
    keluarga: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: "AG0003", 
    nama: "AHMAD NURALIMIN", 
    nip: "198801011998031001",
    alamat: "DESA KLAMPOK",
    noHp: "08345678912",
    jenisKelamin: "L",
    agama: "ISLAM",
    status: "active",
    unitKerja: "SDN Klampok 01",
    tanggalBergabung: "2023-03-10",
    tanggalRegistrasi: "2023",
    foto: null,
    email: "ahmad.nuralimin@example.com",
    dokumen: [],
    keluarga: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: "AG0004", 
    nama: "DJAKA KUMALATARTO, S.Pd, M.Pd", 
    nip: "197002161210012345",
    alamat: "Desa Ketitang, Kecamatan Godong, Kab Grobogan",
    noHp: "08123456789",
    jenisKelamin: "L",
    agama: "ISLAM",
    status: "active",
    unitKerja: "SD Negeri Ketitang",
    tanggalBergabung: "2023-04-01",
    tanggalRegistrasi: "2023",
    foto: null,
    email: "djaka.kumalatarto@example.com",
    dokumen: [],
    keluarga: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

/**
 * Reset anggota data to initial state and return the reset data
 */
export function resetAnggotaData(): Anggota[] {
  saveToLocalStorage(ANGGOTA_KEY, initialAnggota);
  
  // After resetting anggota data, sync unit kerja
  syncUnitKerjaWithAnggota();
  
  return initialAnggota;
}

/**
 * Get all anggota from local storage
 */
export function getAllAnggota(): Anggota[] {
  return getFromLocalStorage<Anggota[]>(ANGGOTA_KEY, initialAnggota);
}

// Alias function for getAllAnggota to fix the import issue
export function getAnggotaList(): Anggota[] {
  return getAllAnggota();
}

/**
 * Get anggota by ID
 */
export function getAnggotaById(id: string): Anggota | undefined {
  const anggotaList = getAllAnggota();
  return anggotaList.find(anggota => anggota.id === id);
}

/**
 * Generate a new anggota ID
 */
export function generateAnggotaId(): string {
  const anggotaList = getAllAnggota();
  const lastId = anggotaList.length > 0 
    ? parseInt(anggotaList[anggotaList.length - 1].id.replace("AG", "")) 
    : 0;
  const newId = `AG${String(lastId + 1).padStart(4, "0")}`;
  return newId;
}

/**
 * Create a new anggota
 */
export function createAnggota(anggota: Omit<Anggota, 'id' | 'createdAt' | 'updatedAt'>): Anggota {
  const anggotaList = getAnggotaList();
  
  const newAnggota: Anggota = {
    ...anggota,
    id: generateAnggotaId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  anggotaList.push(newAnggota);
  saveToLocalStorage(ANGGOTA_KEY, anggotaList);
  
  // Sync unit kerja after creating anggota
  syncUnitKerjaWithAnggota();
  
  // Log audit entry
  logAuditEntry(
    "CREATE",
    "ANGGOTA",
    `Membuat data anggota baru: ${newAnggota.nama} (${newAnggota.id})`,
    newAnggota.id
  );
  
  return newAnggota;
}

/**
 * Update an existing anggota
 */
export function updateAnggota(id: string, anggota: Partial<Anggota>): Anggota | null {
  const anggotaList = getAnggotaList();
  const index = anggotaList.findIndex(a => a.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const oldAnggota = anggotaList[index];
  anggotaList[index] = {
    ...anggotaList[index],
    ...anggota,
    updatedAt: new Date().toISOString(),
  };
  
  saveToLocalStorage(ANGGOTA_KEY, anggotaList);
  
  // Sync unit kerja after updating anggota (in case unit kerja changed)
  syncUnitKerjaWithAnggota();
  
  // Log audit entry
  logAuditEntry(
    "UPDATE",
    "ANGGOTA",
    `Memperbarui data anggota: ${oldAnggota.nama} (${id})`,
    id
  );
  
  return anggotaList[index];
}

/**
 * Delete an anggota by ID
 */
export function deleteAnggota(id: string): boolean {
  const anggotaList = getAnggotaList();
  const anggotaToDelete = anggotaList.find(a => a.id === id);
  const filteredList = anggotaList.filter(anggota => anggota.id !== id);
  
  if (filteredList.length === anggotaList.length) {
    return false;
  }
  
  saveToLocalStorage(ANGGOTA_KEY, filteredList);
  
  // Log audit entry
  if (anggotaToDelete) {
    logAuditEntry(
      "DELETE",
      "ANGGOTA",
      `Menghapus data anggota: ${anggotaToDelete.nama} (${id})`,
      id
    );
  }
  
  return true;
}

/**
 * Validate anggota data against current unit kerja and update if needed
 * This is useful when unit kerja records are updated or deleted
 */
export function validateAnggotaUnitKerja(): number {
  const anggotaList = getAllAnggota();
  const unitKerjaList = getAllUnitKerja().map(uk => uk.nama);
  
  // Default unit kerja to use if an invalid one is found
  const defaultUnitKerja = unitKerjaList.length > 0 ? unitKerjaList[0] : "";
  
  let updatedCount = 0;
  
  const updatedAnggotaList = anggotaList.map(anggota => {
    // If unit kerja is no longer valid, update it
    if (!unitKerjaList.includes(anggota.unitKerja) && defaultUnitKerja) {
      updatedCount++;
      return {
        ...anggota,
        unitKerja: defaultUnitKerja,
        updatedAt: new Date().toISOString()
      };
    }
    return anggota;
  });
  
  if (updatedCount > 0) {
    saveToLocalStorage(ANGGOTA_KEY, updatedAnggotaList);
    // Notify of update
    localStorage.setItem('anggota_updated', new Date().toISOString());
  }
  
  return updatedCount;
}

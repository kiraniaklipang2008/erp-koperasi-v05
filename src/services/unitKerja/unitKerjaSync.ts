
import { UnitKerja } from "@/types/unitKerja";
import { getFromLocalStorage } from "@/utils/localStorage";
import { getAllUnitKerja, saveUnitKerjaList, generateUnitKerjaId } from "./unitKerjaData";
import { resetToInitialUnitKerjaData } from "./unitKerjaInitializer";
import { logAuditEntry } from "../auditService";

/**
 * Helper function to get unique unit kerja from anggota data
 */
function getUnitKerjaFromAnggotaData(): UnitKerja[] {
  // Get anggota data directly from localStorage to avoid circular dependency
  const anggotaData = getFromLocalStorage("koperasi_anggota", []);
  
  // Extract unique unit kerja names from anggota data
  const uniqueUnitKerja = new Set<string>();
  anggotaData.forEach((anggota: any) => {
    if (anggota.unitKerja && anggota.unitKerja.trim()) {
      uniqueUnitKerja.add(anggota.unitKerja.trim());
    }
  });

  // Convert to UnitKerja objects with generated IDs
  const unitKerjaList: UnitKerja[] = [];
  let idCounter = 1;

  uniqueUnitKerja.forEach((nama) => {
    unitKerjaList.push({
      id: `UK${String(idCounter).padStart(3, "0")}`,
      nama,
      keterangan: `Unit kerja ${nama}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    idCounter++;
  });

  return unitKerjaList;
}

/**
 * Initialize unit kerja data from anggota if empty
 */
export function initializeUnitKerjaFromAnggota(): UnitKerja[] {
  const existingData = getAllUnitKerja();
  
  // If no existing data, try to get from anggota, otherwise use mock data
  if (existingData.length === 0) {
    const unitKerjaFromAnggota = getUnitKerjaFromAnggotaData();
    if (unitKerjaFromAnggota.length > 0) {
      console.log("Initializing unit kerja from anggota data...");
      saveUnitKerjaList(unitKerjaFromAnggota);
      return unitKerjaFromAnggota;
    }
  }
  
  return existingData;
}

/**
 * Reset unit kerja data to initial mock data
 */
export function resetUnitKerjaFromAnggota(): UnitKerja[] {
  return resetToInitialUnitKerjaData();
}

/**
 * Sync unit kerja with current anggota data
 */
export function syncUnitKerjaWithAnggota(): number {
  const currentUnitKerja = getAllUnitKerja();
  const unitKerjaFromAnggota = getUnitKerjaFromAnggotaData();
  
  // Track changes
  let addedCount = 0;
  const existingNames = new Set(currentUnitKerja.map(uk => uk.nama));
  
  // Add new unit kerja that exist in anggota but not in unit kerja master
  unitKerjaFromAnggota.forEach(newUnitKerja => {
    if (!existingNames.has(newUnitKerja.nama)) {
      currentUnitKerja.push({
        ...newUnitKerja,
        id: generateUnitKerjaId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      addedCount++;
    }
  });
  
  if (addedCount > 0) {
    saveUnitKerjaList(currentUnitKerja);
    
    logAuditEntry(
      "UPDATE",
      "SYSTEM",
      `Sinkronisasi unit kerja dengan data anggota: ${addedCount} unit kerja baru ditambahkan`
    );
  }
  
  return addedCount;
}


import { JurnalEntry, JurnalDetail } from "@/types/akuntansi";

// Export the type
export type { JurnalEntry, JurnalDetail };

const JURNAL_STORAGE_KEY = "jurnal_entries";

/**
 * Get all journal entries
 */
export function getAllJurnalEntries(): JurnalEntry[] {
  try {
    const data = localStorage.getItem(JURNAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading journal entries:", error);
    return [];
  }
}

/**
 * Get journal entry by ID
 */
export function getJurnalEntryById(id: string): JurnalEntry | undefined {
  const entries = getAllJurnalEntries();
  return entries.find(entry => entry.id === id);
}

/**
 * Check if journal entry exists for a transaction reference
 */
export function getJurnalEntryByReference(referensi: string): JurnalEntry | undefined {
  const entries = getAllJurnalEntries();
  return entries.find(entry => entry.referensi === referensi);
}

/**
 * Generate next journal number
 */
export function generateJurnalNumber(): string {
  const entries = getAllJurnalEntries();
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const prefix = `JU${currentYear}${currentMonth}`;
  const existingNumbers = entries
    .filter(entry => entry.nomorJurnal.startsWith(prefix))
    .map(entry => {
      const suffix = entry.nomorJurnal.replace(prefix, '');
      return parseInt(suffix) || 0;
    })
    .sort((a, b) => b - a);
  
  const nextNumber = existingNumbers.length > 0 ? existingNumbers[0] + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Create new journal entry with duplicate prevention and auto-posting
 */
export function createJurnalEntry(entry: Omit<JurnalEntry, "id" | "createdAt" | "updatedAt">): JurnalEntry {
  const entries = getAllJurnalEntries();
  
  // Check for existing entry with same reference to prevent duplicates
  if (entry.referensi) {
    const existingEntry = entries.find(e => e.referensi === entry.referensi);
    if (existingEntry) {
      console.log(`⚠️ Journal entry already exists for reference ${entry.referensi}, returning existing entry`);
      return existingEntry;
    }
  }
  
  const newEntry: JurnalEntry = {
    ...entry,
    id: `je-${Date.now()}`,
    nomorJurnal: entry.nomorJurnal || generateJurnalNumber(),
    status: 'POSTED', // Auto-post journal entries for immediate sync
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  entries.push(newEntry);
  localStorage.setItem(JURNAL_STORAGE_KEY, JSON.stringify(entries));
  
  console.log(`✅ Journal entry created and auto-posted: ${newEntry.nomorJurnal}`);
  
  // Trigger sync events for Buku Besar and Reports
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('journal-entry-posted', {
      detail: { journalEntry: newEntry }
    }));
  }, 100);
  
  return newEntry;
}

/**
 * Update journal entry
 */
export function updateJurnalEntry(id: string, updates: Partial<JurnalEntry>): JurnalEntry {
  const entries = getAllJurnalEntries();
  const index = entries.findIndex(entry => entry.id === id);
  
  if (index === -1) {
    throw new Error("Jurnal tidak ditemukan");
  }
  
  entries[index] = {
    ...entries[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(JURNAL_STORAGE_KEY, JSON.stringify(entries));
  
  return entries[index];
}

export function deleteJurnalEntry(id: string): boolean {
  const entries = getAllJurnalEntries();
  const entry = entries.find(e => e.id === id);
  
  if (!entry) {
    throw new Error("Jurnal tidak ditemukan");
  }
  
  if (entry.status === 'POSTED') {
    throw new Error("Jurnal yang sudah di-post tidak dapat dihapus");
  }
  
  const filteredEntries = entries.filter(e => e.id !== id);
  localStorage.setItem(JURNAL_STORAGE_KEY, JSON.stringify(filteredEntries));
  
  return true;
}

export function postJurnalEntry(id: string): JurnalEntry {
  const entries = getAllJurnalEntries();
  const index = entries.findIndex(entry => entry.id === id);
  
  if (index === -1) {
    throw new Error("Jurnal tidak ditemukan");
  }
  
  if (entries[index].status !== 'DRAFT') {
    throw new Error("Hanya jurnal draft yang dapat di-post");
  }
  
  entries[index] = {
    ...entries[index],
    status: 'POSTED',
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(JURNAL_STORAGE_KEY, JSON.stringify(entries));
  
  return entries[index];
}

export function reverseJurnalEntry(id: string): JurnalEntry {
  const entries = getAllJurnalEntries();
  const index = entries.findIndex(entry => entry.id === id);
  
  if (index === -1) {
    throw new Error("Jurnal tidak ditemukan");
  }
  
  if (entries[index].status !== 'POSTED') {
    throw new Error("Hanya jurnal yang sudah di-post yang dapat di-reverse");
  }
  
  entries[index] = {
    ...entries[index],
    status: 'REVERSED',
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(JURNAL_STORAGE_KEY, JSON.stringify(entries));
  
  return entries[index];
}

export function validateJurnalEntry(entry: Partial<JurnalEntry>): string[] {
  const errors: string[] = [];
  
  if (!entry.tanggal) {
    errors.push("Tanggal harus diisi");
  }
  
  if (!entry.deskripsi || entry.deskripsi.trim() === '') {
    errors.push("Deskripsi harus diisi");
  }
  
  if (!entry.details || entry.details.length === 0) {
    errors.push("Detail jurnal harus diisi");
  }
  
  if (entry.details && entry.details.length > 0) {
    const totalDebit = entry.details.reduce((sum, detail) => sum + (detail.debit || 0), 0);
    const totalKredit = entry.details.reduce((sum, detail) => sum + (detail.kredit || 0), 0);
    
    if (totalDebit !== totalKredit) {
      errors.push("Total debit dan kredit harus sama");
    }
    
    if (totalDebit === 0) {
      errors.push("Total debit dan kredit tidak boleh nol");
    }
    
    entry.details.forEach((detail, index) => {
      if (!detail.coaId) {
        errors.push(`Detail ${index + 1}: Akun harus dipilih`);
      }
      
      if (detail.debit === 0 && detail.kredit === 0) {
        errors.push(`Detail ${index + 1}: Debit atau kredit harus diisi`);
      }
      
      if (detail.debit > 0 && detail.kredit > 0) {
        errors.push(`Detail ${index + 1}: Tidak boleh mengisi debit dan kredit secara bersamaan`);
      }
    });
  }
  
  return errors;
}

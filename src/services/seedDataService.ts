
import { getFromLocalStorage, saveToLocalStorage } from "@/utils/localStorage";
import { createPengajuan, approvePengajuan, getPengajuanList } from "./pengajuanService";
import { createTransaksi } from "./transaksiService";
import { getAllTransaksi } from "./transaksi/transaksiCore";
import { seedManufakturData } from "./manufaktur/seedManufakturData";
import { seedRetailData } from "./retail/seedRetailData";

const SEED_KEY = "koperasi_seed_v1_done";

/**
 * Seed demo data for MARIYEM (AG0001):
 * 1. Pengajuan Pinjaman Rp 10.000.000 Reguler Tenor 12 → Disetujui
 * 2. Simpanan Pokok Rp 500.000
 * 3. 2x Angsuran payments
 * All synced to accounting/journal/laporan
 */
export function seedDemoData(): void {
  // Only run once
  if (getFromLocalStorage<boolean>(SEED_KEY, false)) {
    console.log("✅ Seed data already applied");
    return;
  }

  const anggotaId = "AG0001"; // MARIYEM
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  console.log("🌱 Seeding demo data for MARIYEM...");

  // 1. Simpanan Pokok Rp 500.000
  const simpananPokok = createTransaksi({
    anggotaId,
    jenis: "Simpan",
    kategori: "Simpanan Pokok",
    jumlah: 500000,
    tanggal: formatDate(new Date(today.getFullYear(), today.getMonth() - 3, 5)),
    keterangan: "Simpanan Pokok anggota MARIYEM",
    status: "Sukses",
  });
  if (simpananPokok) {
    console.log(`✅ Simpanan Pokok created: ${simpananPokok.id} - Rp 500.000`);
  }

  // 2. Pengajuan Pinjaman Rp 10.000.000, Reguler, Tenor 12 bulan
  const pengajuanDate = formatDate(new Date(today.getFullYear(), today.getMonth() - 2, 10));
  const pengajuan = createPengajuan({
    anggotaId,
    jenis: "Pinjam",
    jumlah: 10000000,
    kategori: "Pinjaman Reguler",
    tanggal: pengajuanDate,
    status: "Menunggu",
    keterangan: "Pinjaman Reguler tenor 12 bulan",
    tenor: 12,
  } as any);

  if (pengajuan) {
    console.log(`✅ Pengajuan Pinjaman created: ${pengajuan.id} - Rp 10.000.000`);
    
    // Approve the pengajuan → creates Pinjam transaction + journal
    const approved = approvePengajuan(pengajuan.id);
    if (approved) {
      console.log(`✅ Pengajuan ${pengajuan.id} approved → transaction & journal created`);
    } else {
      console.error(`❌ Failed to approve pengajuan ${pengajuan.id}`);
    }
  }

  // 3. Angsuran 1 (bulan ke-1)
  const angsuran1Date = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 10));
  const angsuran1 = createTransaksi({
    anggotaId,
    jenis: "Angsuran",
    kategori: "Pinjaman Reguler",
    jumlah: 916667, // approx 10jt + bunga / 12
    tanggal: angsuran1Date,
    keterangan: "Angsuran ke-1 Pinjaman Reguler MARIYEM",
    status: "Sukses",
  });
  if (angsuran1) {
    console.log(`✅ Angsuran ke-1 created: ${angsuran1.id} - Rp 916.667`);
  }

  // 4. Angsuran 2 (bulan ke-2)
  const angsuran2Date = formatDate(new Date(today.getFullYear(), today.getMonth(), 10));
  const angsuran2 = createTransaksi({
    anggotaId,
    jenis: "Angsuran",
    kategori: "Pinjaman Reguler",
    jumlah: 916667,
    tanggal: angsuran2Date,
    keterangan: "Angsuran ke-2 Pinjaman Reguler MARIYEM",
    status: "Sukses",
  });
  if (angsuran2) {
    console.log(`✅ Angsuran ke-2 created: ${angsuran2.id} - Rp 916.667`);
  }

  // Mark seed as done
  saveToLocalStorage(SEED_KEY, true);

  // Seed Manufaktur data
  seedManufakturData();

  // Seed Retail data
  seedRetailData();

  // Summary
  const allTx = getAllTransaksi();
  const allPg = getPengajuanList();
  console.log(`🌱 Seed complete! Transactions: ${allTx.length}, Pengajuan: ${allPg.length}`);
}

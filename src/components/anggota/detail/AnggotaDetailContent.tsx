
import { useState } from "react";
import { Anggota } from "@/types";
import { getCurrentUser } from "@/services/authService";
import { 
  getTransaksiByAnggotaId, 
  getOverdueLoans,
  getUpcomingDueLoans,
  calculatePenalty
} from "@/services/transaksi";

import { useAnggotaRealTimeSync } from "@/hooks/useAnggotaRealTimeSync";

import { AnggotaDetailHeader } from "./AnggotaDetailHeader";
import { MainInfoSection } from "./MainInfoSection";
import { TransactionSection } from "./TransactionSection";
import { KeluargaSection } from "./KeluargaSection";
import { FinancialSummaryCards } from "./FinancialSummaryCards";
import { PengajuanPinjamanButton } from "./pinjaman-form";
import { SHUInfoDrawer } from "./shu/SHUInfoDrawer";

interface AnggotaDetailContentProps {
  anggota: Anggota;
}

export function AnggotaDetailContent({ anggota }: AnggotaDetailContentProps) {
  const idAsString: string = String(anggota.id);
  const currentUser = getCurrentUser();
  const isAnggotaUser = currentUser?.roleId === 'anggota';
  
  // Menggunakan hook baru untuk real-time sync
  const { financialData, lastUpdate, refreshFinancialData } = useAnggotaRealTimeSync(idAsString);

  const transaksi = getTransaksiByAnggotaId(idAsString);
  const simpananTransaksi = transaksi.filter(t => t.jenis === "Simpan");
  const pinjamanTransaksi = transaksi.filter(t => t.jenis === "Pinjam");
  const angsuranTransaksi = transaksi.filter(t => t.jenis === "Angsuran");
  
  // Get upcoming loans and overdues
  const jatuhTempo = getUpcomingDueLoans(idAsString, 30);
  const rawTunggakan = getOverdueLoans(idAsString);

  // Filter data specific to this member and add penalty information
  const filteredJatuhTempo = jatuhTempo;
  const filteredTunggakan = rawTunggakan.map(item => ({
    ...item,
    penalty: calculatePenalty(item.transaksi.jumlah, item.daysOverdue)
  }));

  const totalTunggakan = filteredTunggakan.reduce((sum, item) => sum + item.penalty, 0);

  const keluargaCount = anggota?.keluarga?.length || 0;
  const dokumenCount = anggota?.dokumen?.length || 0;

  // Anggota view: premium fintech-style mobile layout
  if (isAnggotaUser) {
    return (
      <div className="space-y-5">
        {/* Greeting & Balance Hero */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
          <p className="text-blue-100 text-xs font-medium mb-1">Total Simpanan</p>
          <p className="text-2xl font-bold tracking-tight">
            Rp {financialData.totalSimpanan.toLocaleString("id-ID")}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <p className="text-blue-200 text-[10px] uppercase tracking-wider">Pinjaman</p>
              <p className="text-sm font-semibold">Rp {financialData.sisaPinjaman.toLocaleString("id-ID")}</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex-1">
              <p className="text-blue-200 text-[10px] uppercase tracking-wider">Angsuran</p>
              <p className="text-sm font-semibold">Rp {financialData.totalAngsuran.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <SHUInfoDrawer totalSHU={financialData.totalSHU} anggotaId={idAsString} />
          <PengajuanPinjamanButton anggotaId={idAsString} anggotaNama={anggota.nama} />
        </div>

        {/* Mini Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Penarikan</p>
            <p className="text-sm font-bold mt-1 text-foreground">
              Rp {financialData.totalPenarikan.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tunggakan</p>
            <p className={`text-sm font-bold mt-1 ${totalTunggakan > 0 ? 'text-red-500' : 'text-foreground'}`}>
              Rp {totalTunggakan.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">SHU</p>
            <p className="text-sm font-bold mt-1 text-emerald-600">
              Rp {financialData.totalSHU.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <TransactionSection 
            transaksi={transaksi} 
            simpananTransaksi={simpananTransaksi}
            pinjamanTransaksi={pinjamanTransaksi}
            angsuranTransaksi={angsuranTransaksi}
            jatuhTempo={filteredJatuhTempo}
            tunggakan={filteredTunggakan}
            anggotaId={idAsString}
          />
        </div>
      </div>
    );
  }

  // Admin/SuperAdmin view: full detail
  return (
    <>
      <AnggotaDetailHeader 
        nama={anggota.nama} 
        keluargaCount={keluargaCount}
        dokumenCount={dokumenCount}
        anggotaId={idAsString}
      />
      
      <div className="mt-4 mb-6 flex justify-between">
        <SHUInfoDrawer totalSHU={financialData.totalSHU} anggotaId={idAsString} />
        <PengajuanPinjamanButton anggotaId={idAsString} anggotaNama={anggota.nama} />
      </div>
      
      <MainInfoSection anggota={anggota} />
      
      <div className="mt-6 mb-6">
        <KeluargaSection 
          anggota={anggota} 
          onAnggotaUpdate={refreshFinancialData}
        />
      </div>
      
      <FinancialSummaryCards 
        totalSimpanan={financialData.totalSimpanan}
        totalPinjaman={financialData.sisaPinjaman}
        totalAngsuran={financialData.totalAngsuran}
        totalPenarikan={financialData.totalPenarikan}
        totalTunggakan={totalTunggakan}
        totalSHU={financialData.totalSHU}
        anggotaId={idAsString}
      />
      
      <div className="mt-6">
        <TransactionSection 
          transaksi={transaksi} 
          simpananTransaksi={simpananTransaksi}
          pinjamanTransaksi={pinjamanTransaksi}
          angsuranTransaksi={angsuranTransaksi}
          jatuhTempo={filteredJatuhTempo}
          tunggakan={filteredTunggakan}
          anggotaId={idAsString}
        />
      </div>
    </>
  );
}

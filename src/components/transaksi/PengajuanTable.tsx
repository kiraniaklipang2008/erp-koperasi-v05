
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/utils/formatters";
import { ActionGrid } from "@/components/ui/action-grid";
import { Pengajuan } from "@/types";
import { getPengaturan } from "@/services/pengaturanService";

interface PengajuanTableProps {
  pengajuan: Pengajuan[];
  onDelete: (id: string) => void;
}

export function PengajuanTable({ pengajuan, onDelete }: PengajuanTableProps) {
  const navigate = useNavigate();
  const pengaturan = getPengaturan();

  const handleView = (id: string) => {
    navigate(`/transaksi/pengajuan/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/transaksi/pengajuan/${id}/edit`);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "Menunggu": "bg-yellow-100 text-yellow-800",
      "Disetujui": "bg-green-100 text-green-800",
      "Ditolak": "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const getJenisBadge = (jenis: string, kategori?: string) => {
    const variants = {
      "Simpan": "bg-blue-100 text-blue-800",
      "Pinjam": "bg-purple-100 text-purple-800",
      "Penarikan": "bg-orange-100 text-orange-800"
    };
    
    // Helper function to get interest rate for loan category
    const getInterestRateForCategory = (category: string): number => {
      if (pengaturan?.sukuBunga?.pinjamanByCategory && 
          category in pengaturan.sukuBunga.pinjamanByCategory) {
        return pengaturan.sukuBunga.pinjamanByCategory[category];
      }
      return pengaturan?.sukuBunga?.pinjaman || 1.5;
    };

    return (
      <div className="space-y-1">
        <Badge className={variants[jenis as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
          {jenis}
        </Badge>
        {jenis === "Pinjam" && kategori && (
          <div className="text-xs text-muted-foreground">
            <div className="font-medium">{kategori}</div>
            <div>Bunga: {getInterestRateForCategory(kategori)}% per bulan</div>
          </div>
        )}
        {jenis === "Simpan" && kategori && (
          <div className="text-xs text-muted-foreground">
            <div className="font-medium">{kategori}</div>
          </div>
        )}
        {jenis === "Penarikan" && kategori && (
          <div className="text-xs text-muted-foreground">
            <div className="font-medium">{kategori}</div>
          </div>
        )}
      </div>
    );
  };

  if (pengajuan.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada data pengajuan
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Pengajuan</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Anggota</TableHead>
          <TableHead>Jenis</TableHead>
          <TableHead>Jumlah</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Keterangan</TableHead>
          <TableHead className="w-24">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pengajuan.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{formatDate(item.tanggal)}</TableCell>
            <TableCell>{item.anggotaNama}</TableCell>
            <TableCell>{getJenisBadge(item.jenis, item.kategori)}</TableCell>
            <TableCell>{formatCurrency(item.jumlah)}</TableCell>
            <TableCell>{getStatusBadge(item.status)}</TableCell>
            <TableCell>{item.keterangan || "-"}</TableCell>
            <TableCell>
              <ActionGrid
                onView={() => handleView(item.id)}
                onEdit={() => handleEdit(item.id)}
                onDelete={() => onDelete(item.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

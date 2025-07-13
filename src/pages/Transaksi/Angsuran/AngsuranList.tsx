
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAllTransaksi, deleteTransaksi } from "@/services/transaksiService";
import { getAllAnggota } from "@/services/anggotaService";
import { TableColumnToggle } from "@/components/ui/table-column-toggle";
import { Transaksi } from "@/types";
import { TransaksiTable } from "@/components/transaksi/TransaksiTable";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AngsuranList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Column visibility state
  const [columns, setColumns] = useState([
    { id: "id", label: "ID Transaksi", isVisible: true },
    { id: "tanggal", label: "Tanggal", isVisible: true },
    { id: "anggota", label: "Anggota", isVisible: true },
    { id: "jumlah", label: "Jumlah", isVisible: true },
    { id: "keterangan", label: "Keterangan", isVisible: true },
    { id: "status", label: "Status", isVisible: true },
  ]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    // Load data from services
    const loadedTransaksi = getAllTransaksi().filter(t => t.jenis === "Angsuran");
    const loadedAnggota = getAllAnggota();
    
    setTransaksiList(loadedTransaksi);
    setAnggotaList(loadedAnggota);
  };
  
  const handleToggleColumn = (columnId: string) => {
    setColumns(prevColumns =>
      prevColumns.map(column => 
        column.id === columnId 
        ? { ...column, isVisible: !column.isVisible } 
        : column
      )
    );
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      const success = deleteTransaksi(deleteId);
      if (success) {
        toast({
          title: "Transaksi angsuran berhasil dihapus",
          description: `Transaksi dengan ID ${deleteId} telah dihapus`,
        });
        loadData();
      } else {
        toast({
          title: "Gagal menghapus transaksi",
          description: "Terjadi kesalahan saat menghapus data transaksi",
          variant: "destructive",
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setDeleteId(null);
  };
  
  // Filter transaksi based on search query
  const filteredTransaksi = transaksiList.filter(transaksi => {
    return transaksi.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (transaksi.anggotaNama || "").toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  return (
    <Layout pageTitle="Daftar Angsuran">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Transaksi Angsuran</h1>
        <Button asChild className="gap-2">
          <Link to="/transaksi/angsuran/tambah">
            <Plus size={16} /> Tambah Angsuran
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Cari berdasarkan ID atau nama anggota..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <TableColumnToggle columns={columns} onToggleColumn={handleToggleColumn} />
          </div>
          
          <div className="overflow-x-auto">
            <TransaksiTable 
              data={filteredTransaksi}
              columns={columns}
              type="angsuran"
              onDelete={handleDeleteClick}
              emptyMessage="Tidak ada data angsuran yang ditemukan"
            />
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi angsuran ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

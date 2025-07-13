
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { getAllTransaksi, deleteTransaksi } from "@/services/transaksiService";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { Transaksi } from "@/types";

export default function SimpanList() {
  const { toast } = useToast();
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [filteredList, setFilteredList] = useState<Transaksi[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSimpananData();
  }, []);

  useEffect(() => {
    filterData();
  }, [transaksiList, searchTerm]);

  const loadSimpananData = () => {
    const allTransaksi = getAllTransaksi();
    const simpananTransaksi = allTransaksi.filter(t => t.jenis === "Simpan");
    setTransaksiList(simpananTransaksi);
  };

  const filterData = () => {
    let filtered = transaksiList;

    if (searchTerm) {
      filtered = filtered.filter(
        (transaksi) =>
          transaksi.anggotaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaksi.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (transaksi.kategori && transaksi.kategori.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredList(filtered);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      const success = deleteTransaksi(id);
      if (success) {
        toast({
          title: "Transaksi berhasil dihapus",
          description: "Data simpanan telah dihapus dari sistem"
        });
        loadSimpananData();
      } else {
        toast({
          title: "Gagal menghapus transaksi",
          description: "Terjadi kesalahan saat menghapus data",
          variant: "destructive"
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  return (
    <Layout pageTitle="Daftar Simpanan">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Daftar Transaksi Simpanan</h1>
        <Button asChild>
          <Link to="/transaksi/simpan/tambah">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Simpanan
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Simpanan</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan nama anggota, ID transaksi, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Transaksi</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama Anggota</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Belum ada data simpanan"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredList.map((transaksi) => (
                    <TableRow key={transaksi.id}>
                      <TableCell className="font-medium">{transaksi.id}</TableCell>
                      <TableCell>{formatDate(transaksi.tanggal)}</TableCell>
                      <TableCell>{transaksi.anggotaNama}</TableCell>
                      <TableCell>{transaksi.kategori || "Umum"}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(transaksi.jumlah)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaksi.status === "Sukses"
                              ? "default"
                              : transaksi.status === "Pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {transaksi.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/transaksi/simpan/${transaksi.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/transaksi/simpan/edit/${transaksi.id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaksi.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

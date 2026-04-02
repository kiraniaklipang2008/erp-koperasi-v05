
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Store, Package, Archive, User, History, Receipt,
  BarChart, LineChart, Truck, ShoppingCart
} from "lucide-react";

const posNavigation = [
  { title: "Penjualan Kasir", icon: Store, description: "Transaksi penjualan produk", path: "/pos/penjualan", color: "bg-blue-100 text-blue-800" },
  { title: "Pemasok", icon: Truck, description: "Kelola data pemasok/supplier", path: "/pos/pemasok", color: "bg-indigo-100 text-indigo-800" },
  { title: "Pembelian", icon: ShoppingCart, description: "Transaksi pembelian produk", path: "/pos/pembelian", color: "bg-blue-100 text-blue-800" },
  { title: "Daftar Penjualan", icon: History, description: "Lihat semua transaksi penjualan", path: "/pos/penjualan-list", color: "bg-indigo-100 text-indigo-800" },
  { title: "Stok Barang", icon: Package, description: "Kelola stok dan produk", path: "/pos/stok", color: "bg-blue-100 text-blue-800" },
  { title: "Inventori", icon: Archive, description: "Kelola inventaris barang", path: "/pos/inventori", color: "bg-indigo-100 text-indigo-800" },
  { title: "Kasir", icon: User, description: "Kelola data kasir", path: "/pos/kasir", color: "bg-blue-100 text-blue-800" },
  { title: "Kuitansi", icon: Receipt, description: "Cetak kuitansi pembayaran", path: "/pos/kuitansi", color: "bg-indigo-100 text-indigo-800" },
  { title: "Laporan Jual Beli", icon: BarChart, description: "Laporan penjualan dan pembelian", path: "/pos/laporan-jual-beli", color: "bg-blue-100 text-blue-800" },
  { title: "Laporan Rugi Laba", icon: LineChart, description: "Laporan keuangan rugi laba", path: "/pos/laporan-rugi-laba", color: "bg-indigo-100 text-indigo-800" },
];

export function RetailDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Point of Sales & Retail</h2>
        <p className="text-sm text-muted-foreground">Kelola penjualan, stok, dan operasional retail Anda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {posNavigation.map((item, index) => (
          <Link key={index} to={item.path}>
            <Card className="hover:shadow-md transition-all h-full border-border">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

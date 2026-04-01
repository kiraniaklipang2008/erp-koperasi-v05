
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Factory, Wrench, ClipboardList, Cog, BarChart3, Boxes } from "lucide-react";

const modules = [
  { title: "Bill of Materials (BOM)", icon: ClipboardList, description: "Daftar bahan & komponen produksi" },
  { title: "Work Orders", icon: Wrench, description: "Perintah kerja & jadwal produksi" },
  { title: "Production Planning", icon: Cog, description: "Perencanaan kapasitas produksi" },
  { title: "Quality Control", icon: Factory, description: "Kontrol kualitas & inspeksi" },
  { title: "Inventory Management", icon: Boxes, description: "Manajemen bahan baku & finished goods" },
  { title: "Production Reports", icon: BarChart3, description: "Laporan produksi & efisiensi" },
];

export function ManufakturPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Manufaktur</h2>
        <p className="text-sm text-muted-foreground">Modul manufaktur untuk pengelolaan produksi end-to-end</p>
      </div>

      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="py-10 flex flex-col items-center text-center">
          <Factory className="h-16 w-16 text-primary/40 mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Sedang Dalam Pengembangan</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Modul Manufaktur sedang dalam tahap pengembangan. Fitur ini akan mencakup manajemen produksi,
            BOM, work orders, quality control, dan pelaporan produksi.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((item, index) => (
          <Card key={index} className="opacity-50 cursor-not-allowed border-border">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-0.5">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

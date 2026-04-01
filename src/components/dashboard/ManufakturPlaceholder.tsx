
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Factory, ClipboardList, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllBOM } from "@/services/manufaktur/bomService";
import { BOM } from "@/types/manufaktur";
import { Badge } from "@/components/ui/badge";

export function ManufakturPlaceholder() {
  const navigate = useNavigate();
  const [bomList, setBomList] = useState<BOM[]>([]);

  useEffect(() => {
    setBomList(getAllBOM());
  }, []);

  const activeBOM = bomList.filter(b => b.status === 'Active').length;
  const draftBOM = bomList.filter(b => b.status === 'Draft').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Manufaktur</h2>
        <p className="text-sm text-muted-foreground">Modul manufaktur untuk pengelolaan produksi end-to-end</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/manufaktur/bom")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total BOM</p>
                <p className="text-3xl font-bold">{bomList.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">BOM Aktif</p>
                <p className="text-3xl font-bold text-green-600">{activeBOM}</p>
              </div>
              <Badge variant="default">{activeBOM} Active</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">BOM Draft</p>
                <p className="text-3xl font-bold text-muted-foreground">{draftBOM}</p>
              </div>
              <Badge variant="secondary">{draftBOM} Draft</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/manufaktur/bom/tambah")}>
            <Plus className="h-4 w-4 mr-1" /> Buat BOM Baru
          </Button>
          <Button variant="outline" onClick={() => navigate("/manufaktur/bom")}>
            <ClipboardList className="h-4 w-4 mr-1" /> Lihat Semua BOM
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="py-8 flex flex-col items-center text-center">
          <Factory className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground mb-1">Fitur Dalam Pengembangan</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Work Orders, Production Planning, Quality Control, dan Inventory Management akan segera hadir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

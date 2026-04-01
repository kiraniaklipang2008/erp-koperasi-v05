
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Factory, ClipboardList, Plus, ArrowRight, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllBOM } from "@/services/manufaktur/bomService";
import { getAllWorkOrders } from "@/services/manufaktur/workOrderService";
import { BOM } from "@/types/manufaktur";
import { Badge } from "@/components/ui/badge";

export function ManufakturPlaceholder() {
  const navigate = useNavigate();
  const [bomList, setBomList] = useState<BOM[]>([]);
  const [woStats, setWoStats] = useState({ total: 0, draft: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    setBomList(getAllBOM());
    const wos = getAllWorkOrders();
    setWoStats({
      total: wos.length,
      draft: wos.filter(w => w.status === 'Draft').length,
      inProgress: wos.filter(w => w.status === 'In Progress').length,
      completed: wos.filter(w => w.status === 'Completed').length,
    });
  }, []);

  const activeBOM = bomList.filter(b => b.status === 'Active').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Manufaktur</h2>
        <p className="text-sm text-muted-foreground">Modul manufaktur untuk pengelolaan produksi end-to-end</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/manufaktur/bom")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total BOM</p>
                <p className="text-2xl font-bold">{bomList.length}</p>
                <p className="text-xs text-muted-foreground">{activeBOM} aktif</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/manufaktur/work-orders")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Work Orders</p>
                <p className="text-2xl font-bold">{woStats.total}</p>
                <p className="text-xs text-muted-foreground">{woStats.inProgress} berjalan</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground">WO In Progress</p>
              <p className="text-2xl font-bold text-primary">{woStats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-muted-foreground">WO Selesai</p>
              <p className="text-2xl font-bold">{woStats.completed}</p>
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
          <Button variant="outline" onClick={() => navigate("/manufaktur/work-orders/tambah")}>
            <Plus className="h-4 w-4 mr-1" /> Buat Work Order
          </Button>
          <Button variant="outline" onClick={() => navigate("/manufaktur/bom")}>
            <ClipboardList className="h-4 w-4 mr-1" /> Daftar BOM
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="outline" onClick={() => navigate("/manufaktur/work-orders")}>
            <Wrench className="h-4 w-4 mr-1" /> Daftar Work Order
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
            Production Planning, Quality Control, dan Inventory Management akan segera hadir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

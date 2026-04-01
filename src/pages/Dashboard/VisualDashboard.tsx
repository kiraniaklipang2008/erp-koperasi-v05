
import React, { useState } from 'react';
import Layout from "@/components/layout/Layout";
import { KoperasiVisualDashboard } from '@/components/dashboard/KoperasiVisualDashboard';
import { RetailDashboard } from '@/components/dashboard/RetailDashboard';
import { ManufakturPlaceholder } from '@/components/dashboard/ManufakturPlaceholder';
import { Building2, Store, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';

type BusinessTab = 'koperasi' | 'retail' | 'manufaktur';

const tabs = [
  { id: 'koperasi' as const, label: 'Koperasi', icon: Building2, description: 'Simpan Pinjam & Keuangan' },
  { id: 'retail' as const, label: 'Retail', icon: Store, description: 'Point of Sales' },
  { id: 'manufaktur' as const, label: 'Manufaktur', icon: Factory, description: 'Produksi & BOM' },
];

export default function VisualDashboard() {
  const [activeTab, setActiveTab] = useState<BusinessTab>('koperasi');

  return (
    <Layout pageTitle="Dashboard">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-3 py-3 sm:py-4 transition-all text-center border-2",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:bg-accent"
              )}
            >
              <tab.icon className={cn("h-6 w-6 sm:h-7 sm:w-7", activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground")} />
              <span className="text-sm sm:text-base font-bold">{tab.label}</span>
              <span className={cn("text-[10px] sm:text-xs hidden sm:block", activeTab === tab.id ? "text-primary-foreground/80" : "text-muted-foreground/70")}>{tab.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'koperasi' && <KoperasiVisualDashboard />}
      {activeTab === 'retail' && <RetailDashboard />}
      {activeTab === 'manufaktur' && <ManufakturPlaceholder />}
    </Layout>
  );
}

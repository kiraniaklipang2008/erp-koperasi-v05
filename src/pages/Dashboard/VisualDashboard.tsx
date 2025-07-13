
import React from 'react';
import Layout from "@/components/layout/Layout";
import { KoperasiVisualDashboard } from '@/components/dashboard/KoperasiVisualDashboard';

export default function VisualDashboard() {
  return (
    <Layout pageTitle="Dashboard Visual">
      <KoperasiVisualDashboard />
    </Layout>
  );
}

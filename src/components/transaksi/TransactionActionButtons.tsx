
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TransactionActionButtonsProps {
  transactionId: string;
  transactionType: 'simpan' | 'penarikan' | 'pinjam' | 'angsuran';
  size?: 'default' | 'sm' | 'lg';
}

export function TransactionActionButtons({ 
  transactionId, 
  transactionType,
  size = 'sm'
}: TransactionActionButtonsProps) {
  const getDetailPath = () => {
    switch (transactionType) {
      case 'simpan':
        return `/transaksi/simpan/${transactionId}`;
      case 'penarikan':
        return `/transaksi/penarikan/${transactionId}`;
      case 'pinjam':
        return `/transaksi/pinjam/${transactionId}`;
      case 'angsuran':
        return `/transaksi/angsuran/${transactionId}`;
      default:
        return `/transaksi/${transactionType}/${transactionId}`;
    }
  };

  return (
    <div className="flex gap-1">
      <Link to={getDetailPath()}>
        <Button variant="outline" size={size} className="gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300">
          <Eye className="h-3 w-3" />
          Detail
        </Button>
      </Link>
    </div>
  );
}

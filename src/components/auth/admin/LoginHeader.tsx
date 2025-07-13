
import { CreditCard } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function LoginHeader() {
  return (
    <CardHeader className="text-center pb-6 pt-8 px-8">
      <div className="w-16 h-16 bg-gradient-to-br from-koperasi-blue to-koperasi-green rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <CreditCard className="w-8 h-8 text-white" />
      </div>
      <CardTitle className="text-2xl font-bold text-koperasi-dark">
        Selamat Datang
      </CardTitle>
      <CardDescription className="text-koperasi-gray text-base">
        Masuk ke sistem manajemen koperasi
      </CardDescription>
    </CardHeader>
  );
}

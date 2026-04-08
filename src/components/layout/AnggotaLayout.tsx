
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Lock, Menu, ChevronLeft, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { logoutUser, getCurrentUser } from "@/services/authService";
import "@/styles/form-styles.css";

type AnggotaLayoutProps = {
  children: ReactNode;
  pageTitle: string;
};

export default function AnggotaLayout({ children, pageTitle }: AnggotaLayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  document.title = `${pageTitle} | Koperasi-ERP`;
  
  const handleLogout = () => {
    logoutUser();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem",
    });
    navigate("/anggota/login");
    setIsMenuOpen(false);
  };
  
  const handleChangePassword = () => {
    navigate("/anggota/change-password");
    setIsMenuOpen(false);
  };

  const initials = currentUser?.nama
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "A";
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col max-w-lg mx-auto relative">
      {/* Status bar spacer for native feel */}
      <div className="h-[env(safe-area-inset-top,0px)]" />
      
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-blue-500/20 ring-offset-2">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Selamat datang,</p>
              <h1 className="text-sm font-semibold text-foreground leading-tight truncate max-w-[180px]">
                {currentUser?.nama}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Slide-over Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100]">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Menu</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Profile card */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 mb-6 text-white">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-white/30">
                    <AvatarFallback className="bg-white/20 text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{currentUser?.nama}</p>
                    <p className="text-xs text-white/70">ID: {currentUser?.anggotaId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={handleChangePassword}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-foreground hover:bg-slate-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-slate-600" />
                  </div>
                  <span>Ubah Password</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-red-500" />
                  </div>
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-8">
        {children}
      </main>
      
      {/* Bottom safe area */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
      
      {/* Footer */}
      <footer className="text-center text-[11px] text-muted-foreground py-4 border-t border-slate-100 bg-white/50">
        © {new Date().getFullYear()} Koperasi-ERP
      </footer>
    </div>
  );
}

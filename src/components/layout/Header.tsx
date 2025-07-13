
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, Menu } from "lucide-react";
import NotificationBadge from "./NotificationBadge";
import { useSidebar } from "@/components/ui/sidebar";

type HeaderProps = {
  pageTitle: string;
};

export default function Header({ pageTitle }: HeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-white border-b py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 flex items-center justify-between min-h-[56px] sm:min-h-[60px] flex-shrink-0">
      {/* Mobile menu button */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2 h-8 w-8"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-koperasi-dark truncate pr-2 sm:pr-4 min-w-0">
          {pageTitle}
        </h1>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
        <NotificationBadge />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 sm:w-48 md:w-56">
            <DropdownMenuLabel className="text-sm">Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm">Profil</DropdownMenuItem>
            <DropdownMenuItem className="text-sm">Pengaturan</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm">Keluar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

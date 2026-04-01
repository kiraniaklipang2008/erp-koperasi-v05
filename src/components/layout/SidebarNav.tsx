
import { useLocation } from "react-router-dom";
import { LogOut, PiggyBank, Zap, Building2, Store, Factory } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { menuSections } from "./sidebar/menuData";
import { SidebarMenuSection } from "./sidebar/SidebarMenuSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useBusinessTab } from "@/contexts/BusinessTabContext";

export function SidebarNav() {
  const location = useLocation();
  const { activeTab } = useBusinessTab();

  // Filter menu sections by active business tab
  const visibleMenuSections = menuSections.filter(section => {
    if (section.hidden) return false;
    if (!section.tabs) return true; // no tab restriction = show in all
    return section.tabs.includes(activeTab);
  });

  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="icon" 
      className="border-r border-gray-200 hidden md:flex bg-gradient-to-b from-koperasi-light via-white to-gray-50 shadow-lg z-40"
    >
      <SidebarHeader className="border-b border-gray-200 bg-gradient-to-r from-koperasi-blue to-koperasi-green shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 relative">
          <div className="absolute inset-0 bg-black/10 rounded-lg"></div>
          <div className="relative z-10 flex items-center gap-2 sm:gap-3 w-full">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white flex-shrink-0" />
            </div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate group-data-[collapsible=icon]:hidden drop-shadow-sm">
              Koperasi-ERP
            </h1>
            <SidebarTrigger className="ml-auto h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-200" />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="overflow-hidden bg-gradient-to-b from-koperasi-light via-white to-gray-50">
        <ScrollArea className="h-full">
          <div className="p-2 sm:p-3">
            {/* Business Tab Switchers */}
            <div className="mb-4 sm:mb-5 space-y-2 group-data-[collapsible=icon]:hidden">
              {[
                { id: 'koperasi' as const, label: 'Simpan Pinjam', icon: Building2 },
                { id: 'retail' as const, label: 'Retail', icon: Store },
                { id: 'manufaktur' as const, label: 'Manufaktur', icon: Factory },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition-all duration-200 text-left",
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-koperasi-blue to-koperasi-green text-white shadow-lg"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    activeTab === tab.id ? "bg-white/20" : "bg-background"
                  )}>
                    <tab.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold truncate">{tab.label}</span>
                </button>
              ))}
              <Separator className="mt-3 bg-gray-200" />
            </div>
            
            {/* Regular Menu Sections - filtered by active business tab */}
            <div className="space-y-2 sm:space-y-3">
              {visibleMenuSections.map((section, index) => (
                <SidebarMenuSection 
                  key={index} 
                  section={section} 
                  locationPath={location.pathname}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 bg-gradient-to-r from-koperasi-light to-gray-50 backdrop-blur-sm">
        <div className="p-3 sm:p-4">
          <SidebarMenuButton 
            variant="outline"
            tooltip="Keluar"
            className="w-full justify-start bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 hover:text-red-800 border-2 border-red-200 hover:border-red-300 text-sm sm:text-base rounded-xl transition-all duration-200 shadow-md hover:shadow-lg backdrop-blur-sm"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden font-semibold">Keluar</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

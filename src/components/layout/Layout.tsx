
import { ReactNode } from "react";
import Header from "./Header";
import { SidebarNav } from "./SidebarNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/form-styles.css";

type LayoutProps = {
  children: ReactNode;
  pageTitle: string;
};

export default function Layout({ children, pageTitle }: LayoutProps) {
  document.title = `${pageTitle} | Koperasi-ERP`;
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <SidebarNav />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header pageTitle={pageTitle} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="container-responsive py-2 sm:py-3 md:py-4 min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

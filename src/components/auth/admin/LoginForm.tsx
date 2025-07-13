
import { useState } from "react";
import { LoginBranding } from "./LoginBranding";
import { LoginCard } from "./LoginCard";
import { useLoginForm } from "./useLoginForm";
import { ZoomControls } from "@/components/ui/ZoomControls";

interface LoginFormProps {
  title?: string;
  subtitle?: string;
  onSuccessRedirect?: string;
  demoCredentials?: Array<{
    label: string;
    username: string;
    password: string;
  }>;
}

export function LoginForm({
  title = "Login",
  subtitle = "Enter your credentials to access your account",
  onSuccessRedirect = "/",
  demoCredentials,
}: LoginFormProps) {
  const [zoomScale, setZoomScale] = useState(1);
  
  // Filter demo credentials to show only Admin and Demo Quick Login
  const filteredDemoCredentials = demoCredentials?.filter(cred => 
    cred.label === "Admin" || cred.label === "Demo Quick Login"
  );
  
  const { form, onSubmit, isLoading, handleDemoLogin } = useLoginForm({
    onSuccessRedirect,
  });

  const handleZoomChange = (scale: number) => {
    setZoomScale(scale);
  };

  return (
    <>
      <ZoomControls onZoomChange={handleZoomChange} />
      
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4 md:p-6 transition-transform duration-200 origin-center"
        style={{ transform: `scale(${zoomScale})` }}
      >
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left Column - Branding - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <LoginBranding />
          </div>
          
          {/* Right Column - Login Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md px-2 sm:px-0">
              <LoginCard
                form={form}
                onSubmit={onSubmit}
                isLoading={isLoading}
                demoCredentials={filteredDemoCredentials}
                onDemoLogin={handleDemoLogin}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

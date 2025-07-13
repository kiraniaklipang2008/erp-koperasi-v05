
import { LoginForm } from "@/components/auth/admin/LoginForm";

export default function LoginPage() {
  const demoCredentials = [
    { label: "Superadmin", username: "superadmin", password: "password123" },
    { label: "Admin", username: "admin", password: "password123" },
    { label: "Demo Quick Login", username: "demo", password: "demo" },
  ];

  return (
    <LoginForm
      title="KPRI BANGUN"
      subtitle="Login Admin - Gunakan demo/demo untuk akses cepat"
      demoCredentials={demoCredentials}
      onSuccessRedirect="/dashboard"
    />
  );
}


import { LoginForm } from "@/components/auth/admin/LoginForm";

export default function LoginPage() {
  const demoCredentials = [
    { label: "Admin", username: "admin@email.com", password: "password123" },
    { label: "Anggota", username: "AG0001", password: "password123" },
  ];

  return (
    <LoginForm
      title="Koperasi-ERP"
      subtitle="Masuk ke akun Anda"
      demoCredentials={demoCredentials}
      onSuccessRedirect="/dashboard"
    />
  );
}

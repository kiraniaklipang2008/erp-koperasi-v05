
import { LoginForm } from "@/components/auth/admin/LoginForm";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const demoCredentials = [
    { label: "Admin", username: "admin@email.com", password: "password123" },
  ];

  return (
    <div className="relative">
      <LoginForm
        title="Koperasi-ERP"
        subtitle="Masuk ke akun Anda"
        demoCredentials={demoCredentials}
        onSuccessRedirect="/dashboard"
      />
    </div>
  );
}

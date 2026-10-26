import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordCard } from "@/components/auth/ForgotPasswordCard";

export const metadata: Metadata = {
  title: "SWARNANET // Security Token Recovery",
  description: "Reset institutional passcode for MCX Bullion Cross-Contract Terminal",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordCard />
    </AuthLayout>
  );
}

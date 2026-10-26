import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInCard } from "@/components/auth/SignInCard";

export const metadata: Metadata = {
  title: "SWARNANET // Institutional Derivatives Intelligence",
  description: "MCX Bullion Cross-Contract Relative Value & Risk Gateway",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <SignInCard />
    </AuthLayout>
  );
}

import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignUpCard } from "@/components/auth/SignUpCard";

export const metadata: Metadata = {
  title: "SWARNANET // Terminal Registration",
  description: "Register institutional desk credentials for MCX Bullion Cross-Contract Terminal",
};

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUpCard />
    </AuthLayout>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SWARNANET // MCX Bullion Derivatives Intelligence",
  description:
    "Institutional Quantitative Trading & Commodity Derivatives Terminal for MCX Bullion Cross-Contract Relative Value, Calendar Carry Decomposition & Risk Management.",
  icons: {
    icon: "/images/app-logo-square.png",
    apple: "/images/app-logo-square.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans bg-[#101112] text-[#F1EEE7] antialiased selection:bg-[#D8D0C0] selection:text-[#17191B]`}
      >
        {children}
      </body>
    </html>
  );
}

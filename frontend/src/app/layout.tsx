import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SalonProvider } from "@/contexts/SalonContext";
import { SALON_NAME, SALON_TAGLINE } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: SALON_NAME,
  description: SALON_TAGLINE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <SalonProvider>{children}</SalonProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

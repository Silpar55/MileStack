import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "./components/LayoutWrapper";
import { AuthProvider } from "./contexts/AuthContext";
import { SessionProvider } from "./components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Milestack - Master Concepts, Earn AI Assistance",
  description:
    "Transform your learning with Milestack. Earn AI assistance through demonstrated competency. Master concepts, own your work - where academic integrity meets intelligent learning support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AuthProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

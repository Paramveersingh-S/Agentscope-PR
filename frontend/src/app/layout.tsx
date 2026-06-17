import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageContainer } from "@/components/layout/PageContainer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PR Sentinel - Multi-Agent Review",
  description: "Enterprise multi-agent pull request analysis dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PageContainer>
          {children}
        </PageContainer>
      </body>
    </html>
  );
}

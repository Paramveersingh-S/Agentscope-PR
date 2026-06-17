import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import QueryProvider from "./QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentScope PR Sentinel",
  description: "Enterprise multi-agent pull request analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex bg-background text-foreground antialiased`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-auto p-6 md:p-8">
            <QueryProvider>
              {children}
            </QueryProvider>
          </main>
        </div>
      </body>
    </html>
  );
}

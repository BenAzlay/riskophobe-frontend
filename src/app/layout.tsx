import "../styles/globals.css";
import { Inter } from "next/font/google";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ConnectWalletModal from "@/components/ConnectWalletModal";
import ClientProviders from "./ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Riskophobe | Options for Crypto",
  description: "Invest Risk-Free. Get Money Back.",
};

export const viewport = "width=device-width, initial-scale=1";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="riskophobe">
      <body className={inter.className}>
        <ClientProviders>
          <Navbar />
          <main className="mb-16 sm:mb-0">{children}</main>
          <BottomNav />
          <ConnectWalletModal />
        </ClientProviders>
      </body>
    </html>
  );
}

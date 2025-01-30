import "../styles/globals.css";
import { Inter } from "next/font/google";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ConnectWalletModal from "@/components/ConnectWalletModal";
import ClientProviders from "./ClientProviders";
import DisclaimerModal from "@/components/DisclaimerModal";
import DisclaimerWrapper from "@/components/DisclaimerWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Riskophobe | Options for Crypto",
  description: "Invest in Tokens Risk-Free. Return it anytime. Get Money Back.",
  keywords:
    "crypto options, Ethereum options, DeFi, risk-free investing, Base, DeFi, decentralized finance",
  openGraph: {
    title: "Riskophobe | Options for Crypto",
    description:
      "Invest in Tokens Risk-Free. Return it anytime. Get Money Back.",
    url: "https://riskophobe.com",
    siteName: "Riskophobe",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Riskophobe platform for crypto options",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Riskophobe",
    title: "Riskophobe | Options for Crypto",
    description:
      "Invest in Tokens Risk-Free. Return it anytime. Get Money Back.",
  },
  themeColor: "#6B46C1", // Set your brand's primary theme color
  viewport:
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
  robots: "index, follow", // Allows indexing and crawling by search engines
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  creator: "Riskophobe Team",
  applicationName: "Riskophobe",
  generator: "Next.js",
  publisher: "Riskophobe",
  category: "Finance, Decentralized Finance",
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
          <DisclaimerWrapper>
            <Navbar />
            <main className="mb-16 sm:mb-0">{children}</main>
            <BottomNav />
            <ConnectWalletModal />
          </DisclaimerWrapper>
        </ClientProviders>
      </body>
    </html>
  );
}

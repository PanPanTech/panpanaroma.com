import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {site} from '@/lib/site';

export const metadata: Metadata = {
  metadataBase:new URL(site.origin),
  title:{default:'PanPan Aroma | Wholesale Essential Oils & Private Label',template:'%s | PanPan Aroma'},
  description:'Source essential oils, carrier oils and private label collections with PanPan Aroma. Discuss your product, packaging and sampling requirements.',
  robots:site.publicLaunchApproved?{index:true,follow:true}:{index:false,follow:false},
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><a className="skip-link" href="#main">Skip to content</a><Header/>{children}<Footer/></body>
    </html>
  );
}

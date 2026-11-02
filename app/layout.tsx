import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {site} from '@/lib/site';

const GA_MEASUREMENT_ID = "G-QQJ398FJZB";

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
      <body>
        <Script id="ga4" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="beforeInteractive"
          async
        />
        <a className="skip-link" href="#main">Skip to content</a><Header/>{children}<Footer/>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import MainWrapper from "@/components/MainWrapper";
import { Toaster } from 'react-hot-toast';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CartProvider } from "@/providers/CartProvider";
import { MeshProvider } from "@/providers/MeshProvider";
import "@meshsdk/react/styles.css";
// import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Starlord LMS",
  description: "Cardano Blockchain Based LMS",
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: ['/favicon.svg'],
    apple: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" />
        <MeshProvider>
          <CartProvider>
            <MainWrapper>
              <Header />
              {/* <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
              /> */}
              <div className="h-16"></div>
              {children}
              <Footer />
            </MainWrapper>
          </CartProvider>
        </MeshProvider>
      </body>
    </html>
  );
}

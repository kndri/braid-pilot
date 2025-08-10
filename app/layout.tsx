import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Braid Pilot - Stop Answering DMs. Start Booking.",
  description: "Our tools handle pricing, booking, and payments, so you can focus on braiding.",
  keywords: "hair braiding, salon management, booking system, payment processing, braid styles, hair salon software",
  openGraph: {
    title: "Braid Pilot - Stop Answering DMs. Start Booking.",
    description: "Our tools handle pricing, booking, and payments, so you can focus on braiding.",
    type: "website",
    siteName: "Braid Pilot",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

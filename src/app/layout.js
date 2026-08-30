import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import InstallPrompt from "./install-prompt";
import SWRegister from "./sw-register";
import NotificationPrompt from "./notification-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TripSheetHQ — Trip Sheets, ACE/ACI Documents & Dispatch Messaging",
  description: "TripSheetHQ replaces paper trip logs and scattered texts with one dashboard your drivers and dispatchers actually use.",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TripSheetHQ",
  url: "https://tripsheethq.com",
  logo: "https://tripsheethq.com/android-chrome-512x512.png",
  description: "Digital trip sheet platform for trucking companies - trip logging, ACE/ACI document delivery, and dispatch messaging.",
  email: "tripsheethq@gmail.com",
  sameAs: [
    "https://wa.me/16478521007",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Registers the service worker - required for the native
            install prompt to reliably fire */}
        <SWRegister />

        <div style={{ flex: 1 }}>{children}</div>
        <Footer />

        {/* Install + notification prompts, site-wide */}
        <InstallPrompt />
        <NotificationPrompt />
      </body>
    </html>
  );
}
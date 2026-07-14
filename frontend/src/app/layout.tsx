import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swift Volt Dealer Management",
  description: "Enterprise Dealer Management System for Swift Volt",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              var originalError = console.error;
              console.error = function() {
                var args = Array.prototype.slice.call(arguments);
                var isFetchError = args.some(function(arg) {
                  return (arg instanceof TypeError && arg.message === 'Failed to fetch') ||
                         (typeof arg === 'string' && arg.includes('Failed to fetch')) ||
                         (arg && arg.message && arg.message.includes('Failed to fetch'));
                });
                if (isFetchError) return;
                originalError.apply(console, args);
              };

              window.addEventListener('error', function(event) {
                if (event.message && event.message.includes('Failed to fetch')) {
                  event.preventDefault();
                }
              });

              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && event.reason.message && event.reason.message.includes('Failed to fetch')) {
                  event.preventDefault();
                }
              });
            }
          `
        }} />
        {children}
        <Script
          id="unregister-sw"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}

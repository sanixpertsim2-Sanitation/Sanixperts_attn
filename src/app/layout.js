import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import MobileCompatibilityProvider from "../components/MobileCompatibilityProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SaniXpert | Give & Go",
  description: "Digital sanitation checklist for Give & Go facilities.",
  manifest: "/manifest.json",
  themeColor: "#05070c",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#05070c" />
        
        {/* Safari-specific CSS */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/styles/safari.css";
  document.head.appendChild(link);
}`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <MobileCompatibilityProvider>
            {children}
          </MobileCompatibilityProvider>
        </Providers>
      </body>
    </html>
  );
}

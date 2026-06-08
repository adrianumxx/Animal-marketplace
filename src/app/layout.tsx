import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Fira_Code } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "600", "700", "900"],
  style: ["normal", "italic"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "PawTrust — Verified Pet Marketplace Benelux",
    template: "%s | PawTrust",
  },
  description:
    "The most trusted marketplace for verified breeders in Belgium, Luxembourg, and the Netherlands. Every seller manually verified.",
  keywords: ["pets", "breeder", "dogs", "cats", "Belgium", "Netherlands", "Luxembourg", "verified"],
  openGraph: { type: "website", siteName: "PawTrust" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("pawtrust-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${plusJakarta.variable} ${firaCode.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

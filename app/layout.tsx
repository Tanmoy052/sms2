import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SWRProvider } from "@/lib/swr-config"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "CGEC Student Portal",
  description:
    "Student Management System for Coochbehar Government Engineering College",

  metadataBase: new URL("https://cgec-sms-portal.vercel.app"),

  openGraph: {
    title: "CGEC Student Portal",
    description:
      "Student Management System for Coochbehar Government Engineering College",
    type: "website",
    url: "/",
    siteName: "CGEC Student Portal",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CGEC Student Portal",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CGEC Student Portal",
    description:
      "Student Management System for Coochbehar Government Engineering College",
    images: ["/og.png"],
  },

  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <SWRProvider>{children}</SWRProvider>
        <Analytics />
      </body>
    </html>
  )
}

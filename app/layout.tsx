import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import LayoutWithBackButton from "@/components/LayoutWithBackButton";
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
//imports needed for layout.tsx 

const inter = Inter({ subsets: ["latin"] })
//inter font for the app 

// Update the metadata
export const metadata = {
  title: "Mindful Motion",
  description: "A comprehensive platform for physical and mental wellbeing"
}
//metadata for the app 

export default function RootLayout({  //root layout for the app   
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LayoutWithBackButton>
            {children}
          </LayoutWithBackButton>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}


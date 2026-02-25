import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CRB Deckbuilder",
  description: "Build and export CookieRun Braverse decks easily."
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

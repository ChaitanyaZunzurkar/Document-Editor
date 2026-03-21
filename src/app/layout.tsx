import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner"; 
import './globals.css';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://document-editor-nine.vercel.app"), 
  
  title: {
    default: "Document Editor | Real-time Collaborative Writing",
    template: "%s | Document Editor", 
  },
  description: "A fast, real-time collaborative document editor. Write, share, and edit documents with your team seamlessly.",
  applicationName: "Document Editor",
  authors: [{ name: "Chaitanya Zunzurkar", url: "https://github.com/ChaitanyaZunzurkar" }],
  generator: "Next.js",
  keywords: [
    "document editor", 
    "real-time collaboration", 
    "text editor", 
    "rich text", 
    "team writing", 
    "live cursors",
    "SaaS"
  ],
  creator: "Chaitanya Zunzurkar",
  publisher: "Chaitanya Zunzurkar",
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://document-editor-nine.vercel.app",
    title: "Document Editor | Real-time Collaborative Writing",
    description: "A fast, real-time collaborative document editor. Write, share, and edit documents with your team seamlessly.",
    siteName: "Document Editor",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
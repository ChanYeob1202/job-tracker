import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import JobPageNav from "./components/JobPageNav";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Landr — Land your next role",
  description: "Track every job application in one place. Applications, interviews, and offers, organized.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col px-4 sm:px-6 lg:px-8 py-6 max-w-10xl mx-auto">
        <AuthProvider>
          <JobPageNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

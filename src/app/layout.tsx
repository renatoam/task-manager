import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.scss";

const josefinSans = Josefin_Sans({
  variable: "--font-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Manager",
  description: "A simple task management app. Track your tasks easily! Todo list, task manager, productivity app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${josefinSans.variable}`}>
        {children}
      </body>
    </html>
  );
}

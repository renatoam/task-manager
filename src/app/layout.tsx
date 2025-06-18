import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.scss";
import { cookies } from "next/headers";

const josefinSans = Josefin_Sans({
  variable: "--font-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Manager",
  description: "A simple task management app. Track your tasks easily! Todo list, task manager, productivity app.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")?.value ?? "light";
  return (
    <html lang="en" data-theme={theme}>
      <body className={`${josefinSans.variable}`}>
        {children}
      </body>
    </html>
  );
}

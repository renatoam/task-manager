"use client";
import { AuthProvider } from "../../shared/contexts/auth.context";
import { Header } from "../../shared/ui/header";
import Content from "./fragments/Content";

export default function Home() {
  return (
    <AuthProvider>
      <Header />
      <Content />
    </AuthProvider>
  );
}

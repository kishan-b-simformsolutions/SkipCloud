"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return <AuthProvider>{children}</AuthProvider>;
}

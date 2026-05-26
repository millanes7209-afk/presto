// app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a login por defecto
    router.push("/login");
  }, [router]);

  return null;
}

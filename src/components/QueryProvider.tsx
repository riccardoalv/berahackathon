"use client"; // Essencial para marcar este como um Componente de Cliente

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Criamos um novo componente que encapsula o QueryClientProvider
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Usamos useState para garantir que o QueryClient só seja criado uma vez
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
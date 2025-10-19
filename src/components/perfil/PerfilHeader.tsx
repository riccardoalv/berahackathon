"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";

export const PerfilHeader = () => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/")}
        className="hover:bg-accent/10"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <User className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold">Meu perfil</h1>
    </div>
  );
};
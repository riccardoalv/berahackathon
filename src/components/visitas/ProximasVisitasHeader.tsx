"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarClock } from "lucide-react";

export const ProximasVisitasHeader = () => {
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
      <CalendarClock className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold">Próximas visitas</h1>
    </div>
  );
};
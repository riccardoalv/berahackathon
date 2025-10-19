"use client"; // 👈 1. Marcar como Componente de Cliente por causa do useRouter

import { ClipboardList, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // 👈 2. Importar useRouter do next/navigation

const MinhasVisitasPage = () => {
  const router = useRouter(); // 👈 3. Usar o hook useRouter

  // Dados mocados (poderiam vir de uma API)
  const visitas = [
    {
      id: 1,
      endereco: "Rua das Flores, 789",
      familia: "Família Oliveira",
      data: "20/10/2025",
      status: "Concluída",
      tipo: "Acompanhamento hipertenso",
      observacoes: "Pressão controlada, medicação em dia",
    },
    {
      id: 2,
      endereco: "Av. Central, 321",
      familia: "Família Costa",
      data: "18/10/2025",
      status: "Concluída",
      tipo: "Visita pós-parto",
      observacoes: "Mãe e bebê saudáveis",
    },
    {
      id: 3,
      endereco: "Rua do Comércio, 654",
      familia: "Família Pereira",
      data: "15/10/2025",
      status: "Cancelada",
      tipo: "Combate ao Aedes",
      observacoes: "Família não estava em casa",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")} // 👈 4. Usar router.push() para navegar
          className="hover:bg-accent/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Minhas visitas</h1>
      </div>

      <div className="grid gap-4">
        {visitas.map((visita) => (
          <Card key={visita.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{visita.familia}</CardTitle>
                  <CardDescription>{visita.endereco}</CardDescription>
                </div>
                <Badge
                  variant={visita.status === "Concluída" ? "default" : "secondary"}
                >
                  {visita.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Data:</span> {visita.data}
              </p>
              <p className="text-sm">
                <span className="font-medium">Tipo:</span> {visita.tipo}
              </p>
              {visita.observacoes && (
                <p className="text-sm">
                  <span className="font-medium">Observações:</span> {visita.observacoes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MinhasVisitasPage;
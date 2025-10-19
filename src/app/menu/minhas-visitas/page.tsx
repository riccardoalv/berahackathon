'use client';

import { ClipboardList, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MinhaVisita } from "@/lib/mock-data";

const fetchMinhasVisitas = async (): Promise<MinhaVisita[]> => {
  const response = await fetch('/api/minhas-visitas');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const MinhasVisitasPage = () => {
  const router = useRouter();
  const { data: visitas, isLoading, error } = useQuery({
    queryKey: ['minhas-visitas'],
    queryFn: fetchMinhasVisitas,
  });

  const getBadgeClasses = (status: MinhaVisita['status']) => {
    const baseClasses = "border-transparent text-white";
    switch (status) {
      case 'Realizada':
      case 'Concluída':
        return `${baseClasses} bg-green-600`;
      case 'Cancelada':
        return `${baseClasses} bg-red-500`;
      case 'Recusada':
        return `${baseClasses} bg-orange-500`;
      case 'Ausente':
        return `${baseClasses} bg-amber-800`;
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")} 
          className="hover:bg-accent/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Minhas visitas</h1>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Carregando histórico...</p>
          </div>
        ) : error ? (
          <p className="text-destructive text-center">Erro ao carregar o histórico.</p>
        ) : visitas && visitas.length > 0 ? (
          visitas.map((visita) => (
            <Card key={visita.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{visita.familia}</CardTitle>
                    <CardDescription>{visita.endereco}</CardDescription>
                  </div>
                  <Badge
                    className={getBadgeClasses(visita.status)}
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
          ))
        ) : (
          <p className="text-center text-muted-foreground py-10">Nenhuma visita no seu histórico.</p>
        )}
      </div>
    </div>
  );
};

export default MinhasVisitasPage;

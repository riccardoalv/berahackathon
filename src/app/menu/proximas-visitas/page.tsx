'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ProximasVisitasHeader } from "@/components/visitas/ProximasVisitasHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProximaVisita } from "@/lib/mock-data";

const fetchProximasVisitas = async (): Promise<ProximaVisita[]> => {
  const response = await fetch('/api/proximas-visitas');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const cancelVisitRequest = async (id: number) => {
  const response = await fetch(`/api/visitas/${id}/cancelar`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to cancel visit');
  }
  return response.json();
};

const ProximasVisitasPage = () => {
  const queryClient = useQueryClient();
  const { data: visitas, isLoading, error } = useQuery({
    queryKey: ['proximas-visitas'],
    queryFn: fetchProximasVisitas,
  });

  const cancelVisitMutation = useMutation({
    mutationFn: cancelVisitRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proximas-visitas'] });
      queryClient.invalidateQueries({ queryKey: ['minhas-visitas'] });
    },
    onError: (error) => {
      console.error("Failed to cancel visit:", error);
      alert("Ocorreu um erro ao cancelar a visita.");
    }
  });

  return (
    <div className="p-6 space-y-6">
      <ProximasVisitasHeader />

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Carregando visitas...</p>
          </div>
        ) : error ? (
          <p className="text-destructive text-center">Erro ao carregar as visitas.</p>
        ) : visitas && visitas.length > 0 ? (
          visitas.map((visita) => (
            <Card key={visita.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{visita.familia}</CardTitle>
                <CardDescription>{visita.endereco}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                <p className="text-sm">
                  <span className="font-medium">Data:</span> {visita.data} às {visita.horario}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Tipo:</span> {visita.tipo}
                </p>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2">
                <Link href={`/visitas/${visita.id}/formulario`} className="w-full">
                  <Button className="w-full" variant="outline">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Iniciar Visita
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  className="bg-destructive/80 hover:bg-destructive/90"
                  onClick={() => cancelVisitMutation.mutate(visita.id)}
                  disabled={cancelVisitMutation.isPending && cancelVisitMutation.variables === visita.id}
                >
                  {cancelVisitMutation.isPending && cancelVisitMutation.variables === visita.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Cancelar
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-10">Nenhuma visita futura encontrada.</p>
        )}
      </div>
    </div>
  );
};

export default ProximasVisitasPage;
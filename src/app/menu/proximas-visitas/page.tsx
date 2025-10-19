import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProximasVisitasHeader } from "@/components/visitas/ProximasVisitasHeader";

// Em um Componente de Servidor, esta função poderia buscar dados de uma API
const getVisitas = () => {
  return [
    {
      id: 1,
      endereco: "Rua José Poma, 123",
      familia: "Família Silva",
      data: "25/10/2025",
      horario: "14:00",
      tipo: "Acompanhamento gestante",
    },
    {
      id: 2,
      endereco: "Av. Principal, 456",
      familia: "Família Santos",
      data: "26/10/2025",
      horario: "10:30",
      tipo: "Vacinação infantil",
    },
  ];
};

const ProximasVisitasPage = () => {
  const visitas = getVisitas();

  return (
    <div className="p-6 space-y-6">
      {/* Usando o Componente de Cliente para o cabeçalho interativo */}
      <ProximasVisitasHeader />

      {/* O resto da página é renderizado no servidor, melhorando a performance */}
      <div className="grid gap-4">
        {visitas.map((visita) => (
          <Card key={visita.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{visita.familia}</CardTitle>
              <CardDescription>{visita.endereco}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Data:</span> {visita.data} às {visita.horario}
              </p>
              <p className="text-sm">
                <span className="font-medium">Tipo:</span> {visita.tipo}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProximasVisitasPage;
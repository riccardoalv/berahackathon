import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CadastroHeader } from "@/components/cadastro/CadastroHeader"; // Importa o componente de cliente

// Em um Componente de Servidor, você poderia buscar esses dados de uma API
// Ex: const getCasas = async () => { const res = await fetch(...); return res.json(); }
const getCasas = () => {
  return [
    {
      id: 1,
      endereco: "Rua José Poma, 123",
      familia: "Família Silva",
      moradores: 4,
      situacao: "Acompanhamento regular",
      risco: "Baixo",
    },
    {
      id: 2,
      endereco: "Av. Principal, 456",
      familia: "Família Santos",
      moradores: 6,
      situacao: "Gestante no domicílio",
      risco: "Médio",
    },
    {
      id: 3,
      endereco: "Rua das Flores, 789",
      familia: "Família Oliveira",
      moradores: 3,
      situacao: "Hipertenso em tratamento",
      risco: "Alto",
    },
  ];
};

const CadastroPage = () => {
  const casas = getCasas();

  return (
    <div className="p-6 space-y-6">
      {/* Usa o componente de cliente para a parte interativa */}
      <CadastroHeader />

      {/* O resto da página é renderizado no servidor */}
      <div className="grid gap-4 md:grid-cols-2">
        {casas.map((casa) => (
          <Card key={casa.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{casa.familia}</CardTitle>
              <CardDescription>{casa.endereco}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Moradores:</span> {casa.moradores}
              </p>
              <p className="text-sm">
                <span className="font-medium">Situação:</span> {casa.situacao}
              </p>
              <p className="text-sm">
                <span className="font-medium">Risco:</span>{" "}
                <span className={
                  casa.risco === "Alto" ? "text-red-600" :
                  casa.risco === "Médio" ? "text-yellow-600" :
                  "text-green-600"
                }>
                  {casa.risco}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CadastroPage;
"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

import { AppMenu } from "@/components/AppMenu";
import {
  CalendarClock,
  ClipboardList,
  Home,
  Map,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { casasMock, casasToHeatData } from "@/lib/mock-data";

// Carrega o mapa somente no client
const DynamicMap = dynamic(() => import("@/components/DynamicMap"), {
  ssr: false,
  loading: () => <p>Carregando mapa...</p>,
});

// Gradiente do heatmap (amarelo → vermelho)
export const yellowToRed: Record<number, string> = {
  0.2: "#fff7b3",
  0.4: "#ffe27a",
  0.6: "#ffb347",
  0.8: "#ff6f3c",
  1.0: "#b30000",
};

// Atalhos do dashboard
const shortcuts = [
  {
    title: "Próximas visitas",
    description: "Veja suas visitas agendadas",
    icon: CalendarClock,
    path: "/menu/proximas-visitas",
    color: "text-green-500",
  },
  {
    title: "Minhas visitas",
    description: "Histórico de visitas realizadas",
    icon: ClipboardList,
    path: "/menu/minhas-visitas",
    color: "text-purple-500",
  },
  {
    title: "Cadastro de casas",
    description: "Famílias cadastradas",
    icon: Home,
    path: "/menu/cadastro",
    color: "text-orange-500",
  },
];

export default function HomePage() {
  const router = useRouter();

  // Centro de Porto Velho — [lat, lng]
  const center: [number, number] = [-8.76194, -63.90389];

  // Pontos do heatmap — [lng, lat, nível 1..5]
  // Pontos do heatmap — derivados das casas mockadas
  const heatData = useMemo<Array<[number, number, number]>>(
    () => casasToHeatData(casasMock),
    [],
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header / App shell */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppMenu />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Atlas
              </h1>
              <p className="text-xs text-muted-foreground">Sistema ACS/ACE</p>
            </div>
          </div>
          <Activity className="h-6 w-6 text-primary" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Grid principal: mapa à direita, atalhos/estatísticas à esquerda */}
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-8 order-2 lg:order-1">
            <div className="rounded-xl overflow-hidden shadow bg-white h-[70vh]">
              <DynamicMap
                center={center} // [lat, lng]
                zoom={12}
                heatData={heatData} // [lng, lat, nível]
                heatOptions={{
                  radius: 30,
                  blur: 0,
                  minOpacity: 0.9,
                  gradient: yellowToRed,
                }}
              />
            </div>
          </section>

          <aside className="lg:col-span-4 order-1 lg:order-2">
            <div className="grid gap-6">
              {/* Atalhos */}
              <Card>
                <CardHeader>
                  <CardTitle>Atalhos</CardTitle>
                  <CardDescription>Navegue rapidamente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {shortcuts.map((s) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.path}
                          onClick={() => router.push(s.path)}
                          className="w-full text-left flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/30 transition"
                        >
                          <Icon className={`h-6 w-6 ${s.color}`} />
                          <div>
                            <div className="font-medium">{s.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {s.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas simples (placeholder) */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do mês</CardTitle>
                  <CardDescription>Indicadores rápidos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Visitas agendadas
                    </span>
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Visitas realizadas
                    </span>
                    <span className="text-2xl font-bold text-green-500">
                      15
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Famílias acompanhadas
                    </span>
                    <span className="text-2xl font-bold text-orange-500">
                      3
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

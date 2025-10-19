'use client'

import { AppMenu } from "@/components/AppMenu";
import { CalendarClock, ClipboardList, Home, User, Map, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const Index = () => {
  const router = useRouter();

  const shortcuts = [
    {
      title: "Mapa",
      description: "Visualize casas na sua área",
      icon: Map,
      path: "/menu/mapa",
      color: "text-blue-500",
    },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Olá, Agente!</h2>
          <p className="text-muted-foreground text-lg">
            Gerencie suas visitas domiciliares e acompanhamento de famílias
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Card
                key={shortcut.path}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 hover:border-primary/50"
                onClick={() => router.push(shortcut.path)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className={`h-10 w-10 ${shortcut.color}`} />
                  </div>
                  <CardTitle className="mt-4">{shortcut.title}</CardTitle>
                  <CardDescription>{shortcut.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Mês</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Visitas agendadas</span>
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Visitas realizadas</span>
                <span className="text-2xl font-bold text-green-500">15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Famílias acompanhadas</span>
                <span className="text-2xl font-bold text-orange-500">3</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próxima visita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-lg">Família Silva</p>
                <p className="text-sm text-muted-foreground">Rua José Poma, 123</p>
                <p className="text-muted-foreground">25/10/2025 às 14:00</p>
                <p className="text-sm">Acompanhamento gestante</p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Agendada
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;

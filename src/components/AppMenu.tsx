"use client";

import { usePathname } from "next/navigation"; // 1. Importe o usePathname
import Link from "next/link";
import { CalendarClock, ClipboardList, Home, User, Map, Menu as MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Mapa",
    icon: Map,
    path: "/menu/mapa",
  },
  {
    title: "Meu perfil",
    icon: User,
    path: "/menu//perfil",
  },
  {
    title: "Minhas visitas",
    icon: ClipboardList,
    path: "/menu//minhas-visitas",
  },
  {
    title: "Cadastro geral (casas)",
    icon: Home,
    path: "/menu//cadastro",
  },
  {
    title: "Próximas visitas",
    icon: CalendarClock,
    path: "/menu/proximas-visitas",
  },
];

export function AppMenu() {
  const pathname = usePathname(); // 2. Obtenha a rota atual

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent/10"
          aria-label="Abrir menu"
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="text-left text-lg font-semibold">Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // 3. Compare a rota atual com o path do item para definir isActive
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 text-base transition-colors",
                  "hover:bg-accent/10",
                  isActive // Agora a variável existe e funciona!
                    ? "bg-accent/10 text-primary font-medium border-l-4 border-primary"
                    : "text-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
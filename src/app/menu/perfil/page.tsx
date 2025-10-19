import { User, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback} from "@/components/ui/avatar";
import { PerfilHeader } from "../../../components/perfil/PerfilHeader";

// Em uma aplicação real, você buscaria os dados do usuário aqui.
// Como estamos em um Componente de Servidor, podemos usar async/await diretamente.
// Ex: const getUserData = async () => { const session = await auth(); return session.user; }
const getUsuario = () => {
  return {
    nome: "João Silva",
    funcao: "Agente Comunitário de Saúde",
    email: "joao.silva@saude.gov.br",
    telefone: "(69) 99999-9999",
    area: "Microárea 5 - Bairro Nacional",
    registro: "ACS-12345",
  };
};

const getInitials = (name: string) => {
  return name.split(" ").map(n => n[0]).join("");
}

const PerfilPage = () => {
  const usuario = getUsuario();

  return (
    <div className="p-6 space-y-6">
      {/* Componente de Cliente para a parte interativa */}
      <PerfilHeader />

      {/* O resto da página é estático e renderizado no servidor */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getInitials(usuario.nome)}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{usuario.nome}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{usuario.funcao}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Registro</p>
              <p className="font-medium">{usuario.registro}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{usuario.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{usuario.telefone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Área de atuação</p>
              <p className="font-medium">{usuario.area}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerfilPage;
"use client";

import { useState, ChangeEvent, FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Check, Bug, ShieldAlert, UserPlus, Trash2, Home, ArrowLeft, 
  HeartPulse, Droplets, Syringe 
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Tipos para garantir a consistência dos dados
type Member = {
  id: number;
  nome: string;
  cns: string;
  peso: string;
  altura: string;
  vacinas: string;
  condicoes: string;
};

type FormData = {
  tipoImovel: string;
  focosDescricao: string;
  agua: string;
  animais: string;
  qtdAnimais: string;
  risco: string;
  desfecho: string;
};

// Mock inicial dos membros da família
const initialMembers: Member[] = [
  { id: 1, nome: "Maria Silva", cns: "700123456789012", peso: "65", altura: "160", vacinas: "sim", condicoes: "Hipertensa" },
];

export default function FormularioVisitaProgressivoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [formData, setFormData] = useState<FormData>({
    tipoImovel: "",
    focosDescricao: "",
    agua: "",
    animais: "",
    qtdAnimais: "",
    risco: "",
    desfecho: "",
  });
  
  const queryClient = useQueryClient();
  const familiaInfo = { familia: "Família Silva", endereco: "Rua José Poma, 123" };

  // Handlers para gerenciar o estado do formulário
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name: keyof FormData, value: string) => setFormData(prev => ({ ...prev, [name]: value }));
  const handleAddMember = () => setMembers([...members, { id: Date.now(), nome: "", cns: "", peso: "", altura: "", vacinas: "", condicoes: "" }]);
  const handleRemoveMember = (id: number) => setMembers(members.filter(m => m.id !== id));
  const handleMemberChange = (id: number, field: keyof Member, value: string) => setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  const preventInvalidNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => { if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); };

  // Mutação do TanStack Query para enviar os dados para a API
  const completeVisitMutation = useMutation({
    mutationFn: async (data: { formData: FormData; members: Member[] }) => {
      const response = await fetch(`/visitas/${resolvedParams.id}/completar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Falha ao registrar a visita');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proximas-visitas'] });
      queryClient.invalidateQueries({ queryKey: ['minhas-visitas'] });
      router.push("/"); 
    },
    onError: (error) => {
      console.error(error);
      alert("Ocorreu um erro ao salvar a visita.");
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    completeVisitMutation.mutate({ formData, members });
  };

  // Lógica de visibilidade movida para o corpo do componente para ser acessível em todo o JSX
  const isEndemiasComplete = !!(formData.tipoImovel && formData.focosDescricao);
  const isTerrenoBaldio = formData.tipoImovel === 'terreno_baldio';
  const isMoradiaComplete = isTerrenoBaldio || !!(formData.agua && formData.animais && (formData.animais === 'nao' || formData.qtdAnimais));
  const isRiscoDesfechoComplete = !!(formData.risco && formData.desfecho);

  const showMoradia = isEndemiasComplete && !isTerrenoBaldio;
  const showRiscoDesfecho = isEndemiasComplete && isMoradiaComplete;
  const showMoradores = showRiscoDesfecho && isRiscoDesfechoComplete && !isTerrenoBaldio;
  const showSubmit = showRiscoDesfecho && isRiscoDesfechoComplete;

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} type="button"><ArrowLeft className="h-6 w-6" /></Button>
        <Home className="h-8 w-8 text-primary" />
        <div><h1 className="text-3xl font-bold">Registro de Visita Domiciliar</h1><p className="text-muted-foreground">{familiaInfo.familia} - {familiaInfo.endereco}</p></div>
      </div>
      
      <Card>
        <CardHeader><CardTitle>1. Avaliação do Domicílio e Risco</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center gap-2"><Bug className="h-5 w-5 text-amber-600" /><h3 className="font-semibold text-lg">Controle de Endemias</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="tipoImovel">Tipo de Imóvel</Label><Select name="tipoImovel" onValueChange={(v) => handleSelectChange('tipoImovel', v)} required><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="residencia">Residência</SelectItem><SelectItem value="comercio">Comércio</SelectItem><SelectItem value="terreno_baldio">Terreno Baldio</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="focosDescricao">Descrição dos Focos Encontrados</Label><Textarea id="focosDescricao" name="focosDescricao" placeholder="Ex: Pneu com água e larvas no quintal..." value={formData.focosDescricao} onChange={handleFormChange} required /></div>
          </div>

          <div className={showMoradia ? 'block p-4 border rounded-lg space-y-4' : 'hidden'}>
            <div className="flex items-center gap-2"><Droplets className="h-5 w-5 text-blue-600" /><h3 className="font-semibold text-lg">Condições de Moradia</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="agua">Abastecimento de Água</Label><Select name="agua" onValueChange={(v) => handleSelectChange('agua', v)} required={!isTerrenoBaldio}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="rede">Rede Pública</SelectItem><SelectItem value="poco">Poço/Nascente</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="animais">Animais no domicílio?</Label><Select name="animais" onValueChange={(v) => handleSelectChange('animais', v)} required={!isTerrenoBaldio}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="nao">Não</SelectItem></SelectContent></Select></div>
              {formData.animais === 'sim' && (<div className="space-y-2"><Label htmlFor="qtdAnimais">Quantos?</Label><div className="flex items-center gap-2 w-fit"><Button type="button" variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => { const current = Number(formData.qtdAnimais) || 1; const next = Math.max(1, current - 1); handleSelectChange('qtdAnimais', String(next)); }}>-</Button><Input id="qtdAnimais" name="qtdAnimais" type="text" value={formData.qtdAnimais || '1'} readOnly className="text-center font-bold w-20" /><Button type="button" variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => { const current = Number(formData.qtdAnimais) || 0; const next = current + 1; handleSelectChange('qtdAnimais', String(next)); }}>+</Button></div></div>)}
            </div>
          </div>
          
          <div className={showRiscoDesfecho ? 'grid grid-cols-1 md:grid-cols-2 gap-4 pt-4' : 'hidden'}>
            <div className="space-y-2"><Label htmlFor="risco">Grau de Risco da Família</Label><Select name="risco" onValueChange={(v) => handleSelectChange('risco', v)} required><SelectTrigger className="border-red-500"><ShieldAlert className="h-4 w-4 mr-2" /><SelectValue placeholder="Selecione o risco..." /></SelectTrigger><SelectContent><SelectItem value="baixo">Baixo</SelectItem><SelectItem value="medio">Médio</SelectItem><SelectItem value="alto">Alto</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="desfecho">Desfecho da Visita</Label><Select name="desfecho" onValueChange={(v) => handleSelectChange('desfecho', v)} required><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="realizada">Realizada</SelectItem><SelectItem value="recusada">Recusada</SelectItem><SelectItem value="ausente">Ausente</SelectItem></SelectContent></Select></div>
          </div>
        </CardContent>
      </Card>
      
      <div className={showMoradores ? 'block' : 'hidden'}>
        <Card>
          <CardHeader><CardTitle>2. Avaliação Individual dos Moradores</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {members.map((member) => (
              <Card key={member.id} className="bg-muted/30 p-4">
                <div className="flex justify-between items-center mb-4"><h4 className="font-semibold">{member.nome || "Novo Morador"}</h4><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor={`nome-${member.id}`}>Nome Completo</Label><Input id={`nome-${member.id}`} value={member.nome} onChange={(e) => handleMemberChange(member.id, 'nome', e.target.value)} required={!isTerrenoBaldio} /></div><div className="space-y-2"><Label htmlFor={`cns-${member.id}`}>Nº do CNS</Label><Input id={`cns-${member.id}`} value={member.cns} onChange={(e) => handleMemberChange(member.id, 'cns', e.target.value)} required={!isTerrenoBaldio} /></div></div>
                   <div className="p-4 border rounded-lg space-y-4 bg-background">
                      <div className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-red-500" /><h3 className="font-semibold">Saúde Individual</h3></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2"><Label htmlFor={`peso-${member.id}`}>Peso (kg)</Label><Input id={`peso-${member.id}`} type="number" min="0" onKeyDown={preventInvalidNumberInput} value={member.peso} onChange={(e) => handleMemberChange(member.id, 'peso', e.target.value)} /></div>
                          <div className="space-y-2"><Label htmlFor={`altura-${member.id}`}>Altura (cm)</Label><Input id={`altura-${member.id}`} type="number" min="0" onKeyDown={preventInvalidNumberInput} value={member.altura} onChange={(e) => handleMemberChange(member.id, 'altura', e.target.value)} /></div>
                           <div className="space-y-2"><Label htmlFor={`vacinas-${member.id}`}>Vacinação em Dia?</Label><Select value={member.vacinas} onValueChange={(v) => handleMemberChange(member.id, 'vacinas', v)} required={!isTerrenoBaldio}><SelectTrigger><Syringe className="h-4 w-4 mr-2" /><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="nao">Não</SelectItem><SelectItem value="verificar">Verificar</SelectItem></SelectContent></Select></div>
                           <div className="space-y-2"><Label htmlFor={`condicoes-${member.id}`}>Condições de Saúde</Label><Input id={`condicoes-${member.id}`} value={member.condicoes} onChange={(e) => handleMemberChange(member.id, 'condicoes', e.target.value)} placeholder="Ex: Hipertenso, Diabético..." /></div>
                      </div>
                   </div>
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" className="w-full mt-4" onClick={handleAddMember}><UserPlus className="mr-2 h-4 w-4" />Adicionar Morador</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className={showSubmit ? 'block' : 'hidden'}>
        <Button type="submit" className="w-full text-lg p-6" disabled={completeVisitMutation.isPending}>
          {completeVisitMutation.isPending ? 'Salvando...' : (<><Check className="mr-2 h-5 w-5" />Salvar e Finalizar Visita</>)}
        </Button>
      </div>
    </form>
  );
}

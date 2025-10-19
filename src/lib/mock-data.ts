export type Coordenadas = {
  lat: number;
  lng: number;
};

export type ProximaVisita = {
  id: number;
  endereco: string;
  familia: string;
  data: string;
  horario: string;
  tipo: string;
  coordenadas?: Coordenadas;
};

export type MinhaVisita = {
  id: number;
  endereco: string;
  familia: string;
  data: string;
  status: "Concluída" | "Cancelada" | "Realizada" | "Recusada" | "Ausente";
  tipo: string;
  observacoes?: string;
  formData?: any;
  members?: any[];
  coordenadas?: Coordenadas;
};

// NOTE: This is an in-memory store. Data will be reset on server restart.
// Lista de próximas visitas com endereços reais de Porto Velho
let proximasVisitas: ProximaVisita[] = [
  {
    id: 1,
    endereco: "Avenida Calama, 3515 - Bairro Olaria",
    familia: "Família Silva",
    data: "25/10/2025",
    horario: "14:00",
    tipo: "Acompanhamento gestante",
    coordenadas: { lat: -8.748, lng: -63.899 },
  },
  {
    id: 2,
    endereco: "Rua Abunã, 1120 - Bairro São João Bosco",
    familia: "Família Santos",
    data: "26/10/2025",
    horario: "10:30",
    tipo: "Vacinação infantil",
    coordenadas: { lat: -8.7545875, lng: -63.9078766 },
  },
];

// Histórico de visitas com endereços reais de Porto Velho
let minhasVisitas: MinhaVisita[] = [
  {
    id: 3,
    endereco: "Avenida Pinheiro Machado, 850 - Bairro Centro",
    familia: "Família Oliveira",
    data: "20/10/2025",
    status: "Concluída",
    tipo: "Acompanhamento hipertenso",
    observacoes: "Pressão controlada, medicação em dia",
    coordenadas: { lat: -8.7558869, lng: -63.8880798 },
  },
  {
    id: 4,
    endereco: "Rua Nicarágua, 155 - Bairro Nova Porto Velho",
    familia: "Família Costa",
    data: "18/10/2025",
    status: "Concluída",
    tipo: "Visita pós-parto",
    observacoes: "Mãe e bebê saudáveis",
    coordenadas: { lat: -8.76823, lng: -63.87786 },
  },
  {
    id: 5,
    endereco: "Rua Jaci-Paraná, 2130 - Bairro Areal",
    familia: "Família Pereira",
    data: "15/10/2025",
    status: "Cancelada",
    tipo: "Combate ao Aedes",
    observacoes: "Família não estava em casa",
    coordenadas: { lat: -8.76659, lng: -63.8869 },
  },
];

export const getProximasVisitas = () => proximasVisitas;
export const getMinhasVisitas = () => minhasVisitas;

export const completeVisit = (id: number, visitData: { formData: any, members: any[] }) => {
  const visitIndex = proximasVisitas.findIndex(v => v.id === id);
  if (visitIndex === -1) {
    return null;
  }

  const [completedVisit] = proximasVisitas.splice(visitIndex, 1);

  const newCompletedVisit: MinhaVisita = {
    ...completedVisit,
    status: visitData.formData.desfecho,
    observacoes: visitData.formData.focosDescricao,
    formData: visitData.formData,
    members: visitData.members,
    data: new Date().toLocaleDateString('pt-BR'),
  };

  minhasVisitas.unshift(newCompletedVisit);

  return newCompletedVisit;
};

export const cancelVisit = (id: number) => {
  const visitIndex = proximasVisitas.findIndex(v => v.id === id);
  if (visitIndex === -1) {
    return null;
  }

  const [cancelledVisit] = proximasVisitas.splice(visitIndex, 1);

  const newCancelledVisit: MinhaVisita = {
    ...cancelledVisit,
    status: 'Cancelada',
    observacoes: 'Visita cancelada pelo agente.',
    data: new Date().toLocaleDateString('pt-BR'),
  };

  minhasVisitas.unshift(newCancelledVisit);

  return newCancelledVisit;
};

// Função para geocodificar um endereço usando a API do Google Geocoding
import axios from 'axios';

export const geocodeAddress = async (address: string): Promise<Coordenadas | null> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("A chave da API do Google Maps não foi configurada.");
    return null;
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === 'OK' && response.data.results[0]) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
    console.error('Erro ao geocodificar o endereço:', response.data.status);
    return null;
  } catch (error) {
    console.error('Erro na requisição para a API de Geocoding:', error);
    return null;
  }
};
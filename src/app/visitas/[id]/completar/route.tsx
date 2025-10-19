import { NextResponse } from 'next/server';
import { completeVisit } from '@/lib/mock-data';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const visitId = Number(params.id);
    const body = await request.json();

    const completedVisit = completeVisit(visitId, body);

    if (!completedVisit) {
      return NextResponse.json(
        { message: `Visita com ID ${visitId} não encontrada.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Visita registrada com sucesso!', visit: completedVisit },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
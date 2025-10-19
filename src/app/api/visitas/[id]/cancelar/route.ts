import { NextResponse } from 'next/server';
import { cancelVisit } from '@/lib/mock-data';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const visitId = Number(params.id);
    const cancelledVisit = cancelVisit(visitId);

    if (!cancelledVisit) {
      return NextResponse.json(
        { message: `Visita com ID ${visitId} não encontrada.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Visita cancelada com sucesso!', visit: cancelledVisit },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro na API ao cancelar:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

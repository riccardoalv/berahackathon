import { NextResponse } from 'next/server';
import { getMinhasVisitas } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const visitas = getMinhasVisitas();
    return NextResponse.json(visitas);
  } catch (error) {
    console.error('Erro ao buscar minhas visitas:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

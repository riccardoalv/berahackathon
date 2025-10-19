import { NextResponse } from 'next/server';
import { getProximasVisitas } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const visitas = getProximasVisitas();
    return NextResponse.json(visitas);
  } catch (error) {
    console.error('Erro ao buscar próximas visitas:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

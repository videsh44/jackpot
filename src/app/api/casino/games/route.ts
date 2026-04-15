import { NextRequest, NextResponse } from 'next/server';
import { apiFetch } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string | number | undefined> = {};

    // Extract query parameters
    for (const [key, value] of searchParams.entries()) {
      if (value !== undefined && value !== '') {
        params[key] = value;
      }
    }

    const data = await apiFetch('/casino/games', params);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
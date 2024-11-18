import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol'); // Get symbols from query parameters

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

  try {
    const response = await axios.get(url, {
      params: { symbol: symbol },
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY || '07a9b09a-9633-4c9c-8b25-4d81ea1e9e67',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.response?.status || 500 });
  }
}

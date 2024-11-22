import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {

}

export async function POST(request: Request) {
    const body = await request.json();
    const supabase = createClient(cookies());
    const { data, error } = await supabase.from('transactions').insert({
        walletAddress: body.walletAddress,
        tx: body.tx,
        time: new Date().toISOString(),
        type: body.type,
        tokenAAmount: body.tokenAAmount,
        tokenAId: body.tokenAId,
        tokenBAmount: body.tokenBAmount,
        tokenBId: body.tokenBId,
        tokenAPrice: body.tokenAPrice,
        tokenBPrice: body.tokenBPrice,
        swapFee: body.swapFee,
        rpcUrl: body.rpcUrl,
    });
    return NextResponse.json({ data, error });
}

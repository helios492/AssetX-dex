import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const assetTokenId = searchParams.get('assetTokenId');

    const supabase = createClient(cookies());

    // Query to fetch rows where tokenAId OR tokenBId matches assetTokenId
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('swapFee')
        .eq('tokenBId', assetTokenId!)
    return NextResponse.json({ data: transactions, error });
}
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    gemini_key_set: !!process.env.GEMINI_API_KEY,
    gemini_key_prefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(0, 8) + '...' : 'none',
    supabase_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}

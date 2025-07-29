// app/api/icons/route.ts
"use server"
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  const API_KEY = process.env.ICONFINDER_API_KEY;
//   console.log("Query:", query);
//   console.log("API_KEY:", API_KEY);

  if (!query || !API_KEY) {
    return NextResponse.json({ error: 'Missing query or API key' }, { status: 400 });
  }

  const res = await fetch(`https://api.iconfinder.com/v4/icons/search?query=${query}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch icons' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

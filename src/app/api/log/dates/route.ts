// app/api/log/dates/route.ts
import { getUserId } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const userId = await getUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const logs = await prisma.dayLog.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: 'desc' },
  })

  const dates = logs.map((l) => l.date.toISOString().split('T')[0])
  return NextResponse.json(dates)
}
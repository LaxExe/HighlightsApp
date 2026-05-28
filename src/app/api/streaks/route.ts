import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserId } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const streaks = await prisma.streak.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json(streaks)
  } catch (error) {
    console.error('Error fetching streaks:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, condition } = await req.json()
    if (!name || !condition) {
      return NextResponse.json({ error: 'Name and condition are required' }, { status: 400 })
    }

    const streak = await prisma.streak.create({
      data: {
        userId,
        name,
        condition,
        currentStreak: 0,
        bestStreak: 0,
        isDefault: false,
        history: []
      }
    })

    return NextResponse.json(streak)
  } catch (error) {
    console.error('Error creating streak:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { id, email, username } = await req.json()

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email,
        username,
        streaks: {
          create: {
            name: 'Logged today',
            condition: 'user submitted a day log today',
            isDefault: true,
          },
        },
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('[/api/auth] Failed to create user:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
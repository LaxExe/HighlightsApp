import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { id, email, username } = await req.json()

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const cleanUsername = (username || email.split('@')[0] || 'user').trim().toLowerCase()

    // Ensure the username is unique
    let finalUsername = cleanUsername
    const existingUser = await prisma.user.findUnique({
      where: { username: finalUsername },
    })

    if (existingUser && existingUser.id !== id) {
      finalUsername = `${cleanUsername}_${id.substring(0, 4)}`
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email,
        username: finalUsername,
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
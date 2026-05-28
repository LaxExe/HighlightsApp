import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { id, email, username } = await req.json()

  const user = await prisma.user.create({
    data: {
      id,
      email,
      username,
      streaks: {
        create: {
          name: 'Logged today',
          condition: 'user submitted a day log today',
          isDefault: true,
        }
      }
    }
  })

  return NextResponse.json(user)
}
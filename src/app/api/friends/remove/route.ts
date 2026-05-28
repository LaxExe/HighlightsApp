import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserId } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { friendId } = await req.json()

    if (!friendId) {
      return NextResponse.json(
        { error: 'Missing friendId' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { friends: true },
    })

    const friend = await prisma.user.findUnique({
      where: { id: friendId },
      select: { friends: true },
    })

    if (!user || !friend) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        friends: {
          set: user.friends.filter(
            (id) => id !== friendId
          ),
        },
      },
    })

    await prisma.user.update({
      where: { id: friendId },
      data: {
        friends: {
          set: friend.friends.filter(
            (id) => id !== userId
          ),
        },
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
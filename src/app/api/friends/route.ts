import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserId } from '@/lib/auth'

const prisma = new PrismaClient()

function todayUTC() {
  const now = new Date()

  return new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
  )
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req)

    if (!userId) {
      return NextResponse.json(
        {
          friends: [],
          feedItems: [],
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        friends: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json(
        {
          friends: [],
          feedItems: [],
          error: 'User not found',
        },
        { status: 404 }
      )
    }

    // SAFE fallback
    const friendIds: string[] = currentUser.friends || []

    // Fetch friends + streaks
    const friends = await prisma.user.findMany({
      where: {
        id: {
          in: friendIds,
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        streaks: {
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    })

    // Fetch today's feed items
    const today = todayUTC()

    const feedItems = await prisma.friendFeedItem.findMany({
      where: {
        toUserId: userId,
        date: today,
        fromUserId: {
          in: friendIds,
        },
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      friends: friends || [],
      feedItems: feedItems || [],
    })
  } catch (error) {
    console.error('Error fetching friends feed:', error)

    return NextResponse.json(
      {
        friends: [],
        feedItems: [],
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
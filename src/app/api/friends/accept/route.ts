import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserId } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const currentUserId = await getUserId(req)

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        friends: true,
        receivedFriendRequests: true,
      },
    })

    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        friends: true,
      },
    })

    if (!currentUser || !requestingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updatedCurrentFriends = [
      ...new Set([
        ...((currentUser.friends as string[]) || []),
        userId,
      ]),
    ]

    const updatedRequestingFriends = [
      ...new Set([
        ...((requestingUser.friends as string[]) || []),
        currentUserId,
      ]),
    ]

    const updatedRequests = (
      (currentUser.receivedFriendRequests as string[]) || []
    ).filter((id) => id !== userId)

    await prisma.user.update({
      where: { id: currentUserId },
      data: {
        friends: updatedCurrentFriends,
        receivedFriendRequests: updatedRequests,
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        friends: updatedRequestingFriends,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('ACCEPT FRIEND ERROR:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
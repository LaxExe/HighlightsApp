import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserId } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { username } = await req.json()
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const cleanUsername = username.trim().toLowerCase()

    // 1. Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 })
    }

    if (currentUser.username.toLowerCase() === cleanUsername) {
      return NextResponse.json({ error: 'Cannot add yourself as a friend' }, { status: 400 })
    }

    // 2. Fetch target user
    const targetUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: cleanUsername,
          mode: 'insensitive'
        }
      }
    })

    if (!targetUser) {
      return NextResponse.json({ error: `User @${username} not found` }, { status: 404 })
    }

    // 3. Validation checks
    if (currentUser.friends.includes(targetUser.id)) {
      return NextResponse.json({ error: `You are already friends with @${targetUser.username}` }, { status: 400 })
    }

    if (currentUser.sentFriendRequests.includes(targetUser.id)) {
      return NextResponse.json({ error: `Friend request already sent to @${targetUser.username}` }, { status: 400 })
    }

    if (currentUser.receivedFriendRequests.includes(targetUser.id)) {
      return NextResponse.json({ error: `@${targetUser.username} has already sent you a request. Accept it below!` }, { status: 400 })
    }

    // 4. Update both users
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          sentFriendRequests: {
            push: targetUser.id
          }
        }
      }),
      prisma.user.update({
        where: { id: targetUser.id },
        data: {
          receivedFriendRequests: {
            push: userId
          }
        }
      })
    ])

    return NextResponse.json({ success: true, message: `Request sent to @${targetUser.username}` })
  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

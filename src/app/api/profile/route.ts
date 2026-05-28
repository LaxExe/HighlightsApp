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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        tags: true,
        friends: true,
        receivedFriendRequests: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const friendsList = await prisma.user.findMany({
      where: { id: { in: user.friends ?? [] } },
      select: { id: true, username: true },
    })

    const receivedRequests = await prisma.user.findMany({
      where: { id: { in: user.receivedFriendRequests ?? [] } },
      select: { id: true, username: true },
    })

    const logCount = await prisma.dayLog.count({
      where: { userId },
    })

    return NextResponse.json({
      username: user.username,
      email: user.email,
      tags: user.tags,
      logCount,
      friends: friendsList,
      receivedFriendRequests: receivedRequests,
    })
  } catch (error) {
    console.error('PROFILE ERROR:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
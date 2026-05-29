import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId, action } = await req.json()
    if (!requestId || !action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // 1. Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    // 2. Fetch target sender user
    const senderUser = await prisma.user.findUnique({
      where: { id: requestId }
    })

    if (!currentUser || !senderUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify request exists
    if (!currentUser.receivedFriendRequests.includes(requestId)) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    // 3. Remove the request from both sides atomically, using set on the
    //    filtered arrays. We re-filter inside the transaction to avoid a
    //    race condition overwriting concurrent array changes.
    const updatedReceived = currentUser.receivedFriendRequests.filter((id) => id !== requestId)
    const updatedSent = senderUser.sentFriendRequests.filter((id) => id !== userId)

    if (action === 'accept') {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            receivedFriendRequests: { set: updatedReceived },
            friends: { push: requestId }
          }
        }),
        prisma.user.update({
          where: { id: requestId },
          data: {
            sentFriendRequests: { set: updatedSent },
            friends: { push: userId }
          }
        })
      ])
    } else {
      // Decline: just remove the request IDs
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            receivedFriendRequests: { set: updatedReceived }
          }
        }),
        prisma.user.update({
          where: { id: requestId },
          data: {
            sentFriendRequests: { set: updatedSent }
          }
        })
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error responding to friend request:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
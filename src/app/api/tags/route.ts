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
      select: { tags: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user.tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tag } = await req.json()
    if (!tag || typeof tag !== 'string') {
      return NextResponse.json({ error: 'Tag string is required' }, { status: 400 })
    }

    const trimmedTag = tag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (trimmedTag.length === 0) {
      return NextResponse.json({ error: 'Invalid tag format' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tags: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.tags.includes(trimmedTag)) {
      return NextResponse.json(user.tags) // Already exists
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tags: {
          push: trimmedTag
        }
      },
      select: { tags: true }
    })

    return NextResponse.json(updatedUser.tags)
  } catch (error) {
    console.error('Error adding tag:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tag = searchParams.get('tag')

    if (!tag) {
      return NextResponse.json({ error: 'Tag parameter is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tags: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedTags = user.tags.filter((t) => t !== tag)

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tags: updatedTags
      },
      select: { tags: true }
    })

    return NextResponse.json(updatedUser.tags)
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

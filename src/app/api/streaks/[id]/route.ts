import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserId } from '@/lib/auth'

const prisma = new PrismaClient()

interface Params {
  params: Promise<{ id: string }>
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const streak = await prisma.streak.findUnique({
      where: { id }
    })

    if (!streak) {
      return NextResponse.json({ error: 'Streak not found' }, { status: 404 })
    }

    if (streak.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (streak.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default streak' }, { status: 400 })
    }

    await prisma.streak.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting streak:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

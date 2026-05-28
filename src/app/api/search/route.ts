import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserId } from '@/lib/auth'

const prisma = new PrismaClient()

interface ParsedHighlight {
  text: string
  tag: string | null
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    const tag = searchParams.get('tag')
    const cursor = searchParams.get('cursor')
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // 1. Build initial query options
    // Fetch logs newest first
    const queryOptions: any = {
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit + 1 // Take one extra to see if there is a next page
    }

    if (cursor) {
      queryOptions.cursor = { id: cursor }
      queryOptions.skip = 1 // Skip the cursor log itself
    }

    if (date) {
      queryOptions.where.date = new Date(date)
    }


    // 2. Fetch logs from database
    let dayLogs = await prisma.dayLog.findMany(queryOptions)

    // 3. Filter by tag if specified
    if (tag) {
      dayLogs = dayLogs.filter((log) => {
        const highlights = log.highlights as unknown as ParsedHighlight[]
        return Array.isArray(highlights) && highlights.some((h) => h.tag === tag)
      })
    }

    // 4. Perform simple text search if q is present
    if (q && q.trim().length > 0 && dayLogs.length > 0) {
      const searchLower = q.toLowerCase()
      dayLogs = dayLogs.filter((log) => {
        const highlights = log.highlights as unknown as ParsedHighlight[]
        const texts = Array.isArray(highlights) ? highlights.map((h) => h.text.toLowerCase()) : []
        return texts.some((t) => t.includes(searchLower))
      })
    }

    // 5. Setup pagination next cursor
    let nextCursor: string | null = null
    if (dayLogs.length > limit) {
      nextCursor = dayLogs[limit - 1].id
      dayLogs = dayLogs.slice(0, limit)
    }

    return NextResponse.json({
      dayLogs,
      nextCursor
    })
  } catch (error) {
    console.error('Error in search endpoint:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

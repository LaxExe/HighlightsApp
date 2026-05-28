import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { runPipeline } from '@/lib/ai/pipeline'
import { calculateStreakUpdate } from '@/lib/utils/streaks'
import { rollShareProbability } from '@/lib/utils/roll'
import { getUserId } from '@/lib/auth'

const prisma = new PrismaClient()

function todayUTC() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { highlights } = await req.json()

    if (!Array.isArray(highlights) || highlights.length < 3 || highlights.length > 7) {
      return NextResponse.json(
        { error: 'Provide between 3 and 7 highlights' },
        { status: 400 }
      )
    }

    const today = todayUTC()

    const existing = await prisma.dayLog.findUnique({
      where: { userId_date: { userId, date: today } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already logged today' }, { status: 409 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { streaks: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { dailyScore, taggedHighlights, streakResults } = await runPipeline(
      highlights,
      user.tags,
      user.streaks.map((s) => ({
        id: s.id,
        name: s.name,
        condition: s.condition,
      }))
    )

    const sharedToFriends = rollShareProbability()

    const dayLog = await prisma.dayLog.create({
      data: {
        userId,
        date: today,
        highlights: taggedHighlights as any,
        dailyScore,
        sharedToFriends,
      },
    })

    const streaksMet: { id: string; name: string }[] = []

    for (const streak of user.streaks) {
      const result = streakResults.find((r) => r.streakId === streak.id)
      const met = result?.met === true

      if (met) {
        streaksMet.push({ id: streak.id, name: streak.name })
      }

      const updated = calculateStreakUpdate(streak, met, today)

      await prisma.streak.update({
        where: { id: streak.id },
        data: {
          currentStreak: updated.currentStreak,
          bestStreak: updated.bestStreak,
          history: updated.history,
        },
      })
    }

    const friends: string[] = user.friends ?? []

    if (sharedToFriends && friends.length > 0) {
      const untaggedHighlights = highlights.map((text: string) => ({
        text,
        tag: null,
      }))

      await prisma.friendFeedItem.createMany({
        data: friends.map((friendId) => ({
          fromUserId: userId,
          toUserId: friendId,
          date: today,
          dayLogSnapshot: {
            highlights: untaggedHighlights,
            dailyScore,
          },
        })),
      })
    }

    const dayTags = Array.from(
      new Set(
        (taggedHighlights as any[])
          .map((h) => h?.tag)
          .filter(Boolean)
      )
    )

    return NextResponse.json({ ...dayLog, streaksMet, dayTags })
  } catch (error) {
    console.error('Error creating day log:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = todayUTC()

    const dayLog = await prisma.dayLog.findUnique({
      where: { userId_date: { userId, date: today } },
    })

    if (!dayLog) {
      return NextResponse.json({ error: 'No log found' }, { status: 404 })
    }

    const dayTags = Array.from(
      new Set(
        (dayLog.highlights as any[])
          .map((h) => h?.tag)
          .filter(Boolean)
      )
    )

    const streaks = await prisma.streak.findMany({
      where: { userId },
    })

    const todayStr = today.toISOString().split('T')[0]

    const streaksMet = streaks
      .filter((s) => {
        const history = s.history as unknown as (string | Date)[]
        return Array.isArray(history) && history.some((d) => {
          const str = d instanceof Date
            ? d.toISOString().split('T')[0]
            : String(d).split('T')[0]
          return str === todayStr
        })
      })
      .map((s) => ({ id: s.id, name: s.name }))

    return NextResponse.json({ ...dayLog, streaksMet, dayTags })
  } catch (error) {
    console.error('Error fetching day log:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

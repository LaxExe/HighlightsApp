import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getUserId } from '@/lib/auth'

const prisma = new PrismaClient()

interface ParsedHighlight {
  text: string
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Check if user has at least 7 days of entries
    const logCount = await prisma.dayLog.count({
      where: { userId }
    })

    if (logCount < 7) {
      return NextResponse.json(
        { error: `You need at least 7 daily logs to generate tags (current logs: ${logCount}).` },
        { status: 400 }
      )
    }

    // 2. Fetch last 7 day logs
    const dayLogs = await prisma.dayLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 7
    })

    // Extract highlight texts
    const highlightTexts: string[] = []
    dayLogs.forEach((log) => {
      const highlights = log.highlights as unknown as ParsedHighlight[]
      if (Array.isArray(highlights)) {
        highlights.forEach((h) => {
          if (h && h.text) {
            highlightTexts.push(h.text)
          }
        })
      }
    })

    if (highlightTexts.length === 0) {
      return NextResponse.json({ suggestedTags: [] })
    }

    // 3. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    })

    const prompt = `You are a personal tag generation assistant. Based on the user's daily highlights from the last 7 days, generate a list of highly specific tags.
Avoid generic tags like "work", "study", "sports", "fun", or "productivity".
Instead, make tags highly specific, such as course codes ("ece-105"), specific activities ("badminton"), projects ("cold-emails"), or tech stack tools ("react").

Here are the highlights from the last 7 days:
${JSON.stringify(highlightTexts, null, 2)}

Provide between 3 and 7 suggested tags.
Output a JSON object with this exact format:
{
  "suggestedTags": ["ece-105", "badminton", "cold-emails"]
}
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    try {
      const parsed = JSON.parse(responseText)
      return NextResponse.json(parsed)
    } catch (err) {
      console.error('Failed to parse Gemini tags response:', responseText, err)
      return NextResponse.json({ error: 'Failed to generate tags' }, { status: 550 })
    }
  } catch (error) {
    console.error('Error generating tags:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai'
import { PIPELINE_SYSTEM_INSTRUCTION, generatePrompt } from './prompts'

interface Highlight {
  text: string
  tag: string | null
}

interface StreakResult {
  streakId: string
  met: boolean
}

interface PipelineResponse {
  dailyScore: number
  taggedHighlights: Highlight[]
  streakResults: StreakResult[]
}

export async function runPipeline(
  highlights: string[],
  userTags: string[],
  userStreaks: Array<{ id: string; name: string; condition: string }>
): Promise<PipelineResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: PIPELINE_SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const prompt = generatePrompt(highlights, userTags, userStreaks)
  const result = await model.generateContent(prompt)
  const responseText = result.response.text()

  try {
    const parsed: PipelineResponse = JSON.parse(responseText)
    return parsed;
  } catch (error) {
    console.error('Failed to parse Gemini pipeline response:', responseText, error)
    throw new Error('Invalid JSON response from AI pipeline')
  }
}

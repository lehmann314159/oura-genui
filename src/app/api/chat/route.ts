import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export const maxDuration = 60

const SYSTEM_PROMPT = `You are a helpful health assistant that analyzes Oura Ring data.

For this demo, use the following sample data when the user asks about their health:

SAMPLE SLEEP DATA (last night):
- Total sleep: 7 hours 21 minutes
- Deep sleep: 1 hour 10 minutes (70 min)
- REM sleep: 1 hour 8 minutes (68 min)
- Light sleep: 5 hours 2 minutes (302 min)
- Awake time: 15 minutes
- Sleep efficiency: 87%
- Bedtime: 10:45 PM
- Wake time: 6:30 AM
- Average heart rate: 52 bpm
- HRV: 45 ms

SAMPLE READINESS DATA:
- Readiness score: 82
- Sleep score: 85
- Activity balance: Good
- Body temperature: Normal (+0.1°C)
- Recovery index: High

SAMPLE ACTIVITY DATA (today):
- Steps: 8,432
- Calories burned: 2,150
- Active time: 45 minutes
- Walking equivalent: 4.2 miles

When responding:
1. Provide a brief, friendly analysis of the data
2. Generate UI components to visualize the data by including a JSON code block

Available UI components:

1. metrics_card - Display key metrics
{
  "type": "metrics_card",
  "title": "Title here",
  "metrics": [
    { "label": "Metric Name", "value": "value", "icon": "moon|activity|heart|zap", "trend": "up|down|neutral" }
  ]
}

2. sleep_stages - Show sleep stage breakdown (values in minutes)
{
  "type": "sleep_stages",
  "deep": 70,
  "rem": 68,
  "light": 302,
  "awake": 15
}

Example response format:
"Based on your sleep data, you got excellent rest last night with 7 hours and 21 minutes of sleep!

\`\`\`json
[
  {
    "type": "metrics_card",
    "title": "Last Night's Sleep",
    "metrics": [
      { "label": "Total Sleep", "value": "7h 21m", "icon": "moon" },
      { "label": "Efficiency", "value": "87%", "icon": "activity", "trend": "up" }
    ]
  },
  {
    "type": "sleep_stages",
    "deep": 70,
    "rem": 68,
    "light": 302,
    "awake": 15
  }
]
\`\`\`
"

Always be conversational and include visualizations for health data queries.`

// Convert UI SDK message format (parts) to standard AI SDK format (content)
function convertMessages(messages: Array<{ role: string; parts?: Array<{ type: string; text?: string }>; content?: string }>) {
  return messages.map((msg) => {
    // If message already has content string, use it
    if (typeof msg.content === 'string') {
      return { role: msg.role, content: msg.content }
    }
    // Convert parts array to content string
    if (msg.parts && Array.isArray(msg.parts)) {
      const content = msg.parts
        .filter((part) => part.type === 'text' && part.text)
        .map((part) => part.text)
        .join('')
      return { role: msg.role, content }
    }
    return { role: msg.role, content: '' }
  })
}

export async function POST(request: Request) {
  const { messages } = await request.json()

  const convertedMessages = convertMessages(messages)

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: SYSTEM_PROMPT,
    messages: convertedMessages,
  })

  return result.toUIMessageStreamResponse()
}

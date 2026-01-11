import { anthropic } from '@ai-sdk/anthropic'
import { streamText, stepCountIs } from 'ai'
import { createMCPClient } from '@ai-sdk/mcp'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

export const maxDuration = 60

function getSystemPrompt() {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  return `You are a helpful health assistant that analyzes Oura Ring data.

Today's date is ${today}. Yesterday was ${yesterday}.

IMPORTANT: Oura attributes sleep data to the DAY YOU WAKE UP, not when you went to bed.
So "last night's sleep" is stored under TODAY's date (${today}), not yesterday.
When querying sleep data, always use a date RANGE (e.g., start_date: yesterday, end_date: today) rather than a single date to ensure you capture the data.

You have access to tools that fetch real data from the user's Oura Ring:
- get_sleep_data: Get sleep metrics including stages, efficiency, heart rate
- get_activity_data: Get daily activity including steps, calories, active time
- get_readiness_data: Get readiness scores and contributing factors
- get_heart_rate_data: Get heart rate data throughout the day
- get_workout_data: Get workout and exercise session data

When the user asks about their health data:
1. Call the appropriate tool(s) to fetch real data
2. Analyze the data and provide a friendly summary
3. Generate UI components to visualize the data by including a JSON code block

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

Always be conversational and include visualizations for health data queries.
When fetching data, use appropriate date ranges (e.g., yesterday for "last night's sleep", last 7 days for trends).
IMPORTANT: After receiving tool results, always analyze the data and provide a helpful response with UI components.`
}

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

  // Create MCP client connected to the Oura MCP server
  const transport = new StdioClientTransport({
    command: 'node',
    args: [process.env.OURA_MCP_SERVER_PATH!],
    env: {
      ...process.env as Record<string, string>,
      OURA_PERSONAL_ACCESS_TOKEN: process.env.OURA_PERSONAL_ACCESS_TOKEN!,
    },
  })

  const mcpClient = await createMCPClient({
    transport,
  })

  try {
    // Get tools from the MCP server
    const tools = await mcpClient.tools()

    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: getSystemPrompt(),
      messages: convertedMessages,
      tools,
      stopWhen: stepCountIs(5), // Allow up to 5 steps for tool calls
      onFinish: async () => {
        await mcpClient.close()
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    await mcpClient.close()
    throw error
  }
}

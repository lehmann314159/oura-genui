/**
 * MCP Client for Oura integration.
 *
 * TODO: Phase 1 - For now, we'll use a simplified approach where the API route
 * calls the Oura API directly. In Phase 3, this will be replaced with proper
 * MCP client integration when we containerize the services.
 *
 * The MCP server (oura-mcp) will be wrapped in an HTTP endpoint, and this
 * client will connect to it via HTTP/SSE instead of stdio.
 */

export interface OuraToolResult {
  success: boolean
  data?: unknown
  error?: string
}

/**
 * Placeholder for MCP tool calls.
 * In Phase 3, this will use the HTTP MCP transport.
 */
export async function callOuraTool(
  toolName: string,
  params: Record<string, unknown>
): Promise<OuraToolResult> {
  // For now, return a placeholder
  // This will be implemented in Phase 3 with HTTP MCP transport
  console.log(`MCP Tool call: ${toolName}`, params)

  return {
    success: false,
    error: 'MCP integration pending - using demo mode'
  }
}

/**
 * Available Oura tools that the LLM can use.
 * These match the tools defined in the oura-mcp server.
 */
export const OURA_TOOLS_SCHEMA = {
  get_sleep_data: {
    description: 'Get sleep data for a date range',
    parameters: {
      start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
      end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
    },
  },
  get_activity_data: {
    description: 'Get activity data for a date range',
    parameters: {
      start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
      end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
    },
  },
  get_readiness_data: {
    description: 'Get readiness scores for a date range',
    parameters: {
      start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
      end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
    },
  },
}

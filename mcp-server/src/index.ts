/**
 * Oura MCP Server
 *
 * This MCP server provides integration with the Oura Ring API v2.
 * Exports the server class and client for use with HTTP transport.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Oura API configuration
const OURA_API_BASE = "https://api.ouraring.com/v2/usercollection";

// Type definitions for tool arguments
interface ToolArguments {
  start_date?: string;
  end_date?: string;
  days?: string;
  date?: string;
}

/**
 * Oura API Client
 * Handles all interactions with the Oura API
 */
export class OuraClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${OURA_API_BASE}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Oura API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getSleep(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.makeRequest('sleep', params);
  }

  async getDailyActivity(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.makeRequest('daily_activity', params);
  }

  async getDailyReadiness(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.makeRequest('daily_readiness', params);
  }

  async getHeartRate(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.makeRequest('heartrate', params);
  }

  async getWorkouts(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return this.makeRequest('workout', params);
  }
}

/**
 * MCP Server Implementation
 */
export class OuraMCPServer {
  public server: Server;
  private ouraClient: OuraClient;

  constructor(ouraToken: string) {
    this.server = new Server(
      {
        name: "oura-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.ouraClient = new OuraClient(ouraToken);
    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_sleep_data",
          description: "Get sleep data from Oura Ring. Returns detailed sleep metrics including sleep stages, efficiency, and heart rate.",
          inputSchema: {
            type: "object",
            properties: {
              start_date: {
                type: "string",
                description: "Start date in YYYY-MM-DD format (optional, defaults to last 7 days)",
              },
              end_date: {
                type: "string",
                description: "End date in YYYY-MM-DD format (optional, defaults to today)",
              },
            },
          },
        },
        {
          name: "get_activity_data",
          description: "Get daily activity data including steps, calories, active time, and movement metrics.",
          inputSchema: {
            type: "object",
            properties: {
              start_date: {
                type: "string",
                description: "Start date in YYYY-MM-DD format (optional)",
              },
              end_date: {
                type: "string",
                description: "End date in YYYY-MM-DD format (optional)",
              },
            },
          },
        },
        {
          name: "get_readiness_data",
          description: "Get daily readiness scores and contributing factors (sleep, activity balance, body temperature, etc.)",
          inputSchema: {
            type: "object",
            properties: {
              start_date: {
                type: "string",
                description: "Start date in YYYY-MM-DD format (optional)",
              },
              end_date: {
                type: "string",
                description: "End date in YYYY-MM-DD format (optional)",
              },
            },
          },
        },
        {
          name: "get_heart_rate_data",
          description: "Get heart rate data throughout the day",
          inputSchema: {
            type: "object",
            properties: {
              start_date: {
                type: "string",
                description: "Start date in YYYY-MM-DD format (optional)",
              },
              end_date: {
                type: "string",
                description: "End date in YYYY-MM-DD format (optional)",
              },
            },
          },
        },
        {
          name: "get_workout_data",
          description: "Get workout and exercise session data",
          inputSchema: {
            type: "object",
            properties: {
              start_date: {
                type: "string",
                description: "Start date in YYYY-MM-DD format (optional)",
              },
              end_date: {
                type: "string",
                description: "End date in YYYY-MM-DD format (optional)",
              },
            },
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const typedArgs = args as ToolArguments | undefined;

      try {
        let result;

        switch (name) {
          case "get_sleep_data":
            result = await this.ouraClient.getSleep(typedArgs?.start_date, typedArgs?.end_date);
            break;
          case "get_activity_data":
            result = await this.ouraClient.getDailyActivity(typedArgs?.start_date, typedArgs?.end_date);
            break;
          case "get_readiness_data":
            result = await this.ouraClient.getDailyReadiness(typedArgs?.start_date, typedArgs?.end_date);
            break;
          case "get_heart_rate_data":
            result = await this.ouraClient.getHeartRate(typedArgs?.start_date, typedArgs?.end_date);
            break;
          case "get_workout_data":
            result = await this.ouraClient.getWorkouts(typedArgs?.start_date, typedArgs?.end_date);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "analyze_sleep_trends",
          description: "Analyze sleep trends and provide recommendations for improvement",
          arguments: [
            {
              name: "days",
              description: "Number of days to analyze (default: 7)",
              required: false,
            },
          ],
        },
        {
          name: "daily_health_summary",
          description: "Generate a comprehensive daily health summary from all metrics",
          arguments: [
            {
              name: "date",
              description: "Date to summarize (YYYY-MM-DD, default: today)",
              required: false,
            },
          ],
        },
      ],
    }));

    // Get prompt details
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const typedArgs = args as ToolArguments | undefined;

      const today = new Date().toISOString().split('T')[0];

      if (name === "analyze_sleep_trends") {
        const days = typedArgs?.days || "7";
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please analyze my sleep trends over the last ${days} days. Use get_sleep_data to retrieve my sleep data from ${startDate.toISOString().split('T')[0]} to ${today}, then provide insights on:
1. Sleep duration patterns
2. Sleep quality and efficiency
3. Sleep stage distribution
4. Recommendations for improvement`,
              },
            },
          ],
        };
      }

      if (name === "daily_health_summary") {
        const date = typedArgs?.date || today;

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please create a comprehensive health summary for ${date}. Use the following tools:
- get_sleep_data for ${date}
- get_activity_data for ${date}
- get_readiness_data for ${date}

Then provide a summary covering:
1. Overall readiness and recovery
2. Sleep quality and duration
3. Activity levels and energy expenditure
4. Key insights and recommendations`,
              },
            },
          ],
        };
      }

      throw new Error(`Unknown prompt: ${name}`);
    });

    // Resources (for reading data without explicit tool calls)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: "oura://sleep/latest",
          name: "Latest Sleep Data",
          description: "Most recent sleep session data",
          mimeType: "application/json",
        },
        {
          uri: "oura://activity/today",
          name: "Today's Activity",
          description: "Activity data for today",
          mimeType: "application/json",
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        let data;

        if (uri === "oura://sleep/latest") {
          const result = await this.ouraClient.getSleep();
          data = result.data?.[0] || null;
        } else if (uri === "oura://activity/today") {
          const today = new Date().toISOString().split('T')[0];
          const result = await this.ouraClient.getDailyActivity(today, today);
          data = result.data?.[0] || null;
        } else {
          throw new Error(`Unknown resource: ${uri}`);
        }

        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to read resource: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }
}

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const simpleTest = createTool({
  id: "simple-test",
  description: "A simple test tool to verify the framework is working",
  inputSchema: z.object({
    message: z.string().describe("A test message"),
  }),
  outputSchema: z.object({
    result: z.string(),
    timestamp: z.string(),
  }),
  execute: async ({ context }) => {
    console.log("Simple test tool executed with context:", context);

    return {
      result: `Received: ${context?.message || "No message"}`,
      timestamp: new Date().toISOString(),
    };
  },
});

import { Mastra } from "@mastra/core";
import { agents } from "./agents";

export const mastra = new Mastra({
  agents,
});

export * from "./agents";

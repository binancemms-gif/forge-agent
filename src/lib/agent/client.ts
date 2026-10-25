import type { AgentRequest, AgentResponse } from "@/lib/agent/provider";

export interface AgentClient { complete(request: AgentRequest): Promise<AgentResponse>; }
export const groqClient: AgentClient = { complete: async (request) => {
  const response = await fetch("/api/agent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(request) });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() as AgentResponse : undefined;
  if (!response.ok) {
    if (response.status === 404) throw new Error("The agent API is not available on this deployment. Retry after the preview finishes loading.");
    throw new Error(data?.error || `Agent request failed (${response.status})`);
  }
  if (!data) throw new Error("The agent returned an invalid response.");
  return data;
} };

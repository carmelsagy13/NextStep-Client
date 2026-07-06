import apiClient from "./client";
import type { DemoTriggerResponse } from "../types";

/**
 * Triggers the automated Demo Mode roadmap generation.
 *
 * - No request body; the user is resolved from the JWT.
 * - First call (user has no profile) runs the full Open Finance + LLM pipeline
 *   and returns `mode: "full"` with the fresh roadmap state + goals.
 * - Subsequent calls run a lightweight aspiration sync and return
 *   `mode: "partial"` with the number of updated tasks.
 *
 * Long timeout (120s) because the LLM runs synchronously server-side.
 */
export const triggerDemo = () =>
  apiClient.post<DemoTriggerResponse>(
    "/demo/trigger",
    {},
    { timeout: 120_000 },
  );

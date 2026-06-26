import apiClient from "./client";
import type { Aspiration, AspirationStatus, GoalType } from "../types";

/** Body for POST /aspirations (create a goal). */
export interface CreateAspirationPayload {
  goalTypeCode: string; // required, must be an active GoalType.code
  targetAmount?: number; // only if the type supportsAmount
  targetDate?: string; // ISO-8601 date, only if the type supportsTimeframe
  attributes?: Record<string, unknown>; // validated against the type's attributeSchema
}

/** Body for PATCH /aspirations/:id (partial update). */
export interface UpdateAspirationPayload {
  targetAmount?: number;
  targetDate?: string; // ISO-8601 date
  attributes?: Record<string, unknown>;
  status?: AspirationStatus;
}

/** Catalog of selectable goal types — drives the goal-type picker. */
export const getAspirationTypes = () =>
  apiClient.get<GoalType[]>("/aspirations/types").then((res) => res.data);

/** The current user's goals (active + achieved only). */
export const getAspirations = () =>
  apiClient.get<Aspiration[]>("/aspirations").then((res) => res.data);

/** Create a goal. Returns the created aspiration. */
export const createAspiration = (payload: CreateAspirationPayload) =>
  apiClient.post<Aspiration>("/aspirations", payload).then((res) => res.data);

/** Edit a goal. Returns the updated aspiration. */
export const updateAspiration = (
  aspirationId: string,
  payload: UpdateAspirationPayload,
) =>
  apiClient
    .patch<Aspiration>(`/aspirations/${aspirationId}`, payload)
    .then((res) => res.data);

/** Abandon (soft-delete) a goal. */
export const deleteAspiration = (aspirationId: string) =>
  apiClient
    .delete<{ message: string }>(`/aspirations/${aspirationId}`)
    .then((res) => res.data);

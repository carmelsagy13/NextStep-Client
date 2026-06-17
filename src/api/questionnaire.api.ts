import apiClient from "./client";
import type { AnswerPayloadItem, Questionnaire } from "@/types/questionnaire";

/** Fetch the ordered tree of screens, questions, options, and visibility rules. */
export const getQuestionnaire = () =>
  apiClient.get<Questionnaire>("/questionnaire").then((res) => res.data);

/** Submit the user's answers as a flat list of key-value pairs for ingestion. */
export const submitQuestionnaireResponses = (answers: AnswerPayloadItem[]) =>
  apiClient.post("/questionnaire/respond", { answers });

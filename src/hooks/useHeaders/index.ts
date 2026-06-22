import { environment } from "@config/environment";

const TOKEN_KEY = "pulltask_token";

export function useHeaders() {
  const getHeaders = () => ({
    "Content-Type":    "application/json",
    "X-Business-Unit": environment.BUSINESS_UNIT,
    Authorization:     `Bearer ${localStorage.getItem(TOKEN_KEY) ?? ""}`,
  });

  return { getHeaders };
}

import { AxiosRequestConfig } from "axios";
import { maxRetriesServices } from "@config/environment";
import { taskBoardQueryInstance } from "@api/taskBoardQueryInstance";
import type { ApiBoard } from "@domain/board";

async function searchAllBoards(
  headers: Record<string, string> = {}
): Promise<ApiBoard[]> {
  const maxRetries = maxRetriesServices;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config: AxiosRequestConfig = {
        headers: { ...headers, "X-Action": "SearchAllBoard" },
        params:  { page: "1", per_page: "50" },
      };

      const { data, status } = await taskBoardQueryInstance.get<ApiBoard[]>(
        "/boards",
        config
      );

      if (status === 204) return [];

      if (!status || status < 200 || status >= 300 || !Array.isArray(data)) {
        throw { message: "Error al obtener los tableros", status, data };
      }

      return data;
    } catch (error) {
      console.error(`[searchAllBoards] attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error("No se pudieron obtener los tableros.");
      }
    }
  }

  return [];
}

export { searchAllBoards };

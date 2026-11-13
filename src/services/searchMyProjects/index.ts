import { AxiosRequestConfig } from "axios";
import { maxRetriesServices } from "@config/environment";
import { taskBoardQueryInstance } from "@api/taskBoardQueryInstance";
import type { ApiProject } from "@domain/project";

// Projects where the authenticated user is a member (the backend decides it from the token)
async function searchMyProjects(
  headers: Record<string, string> = {}
): Promise<ApiProject[]> {
  const maxRetries = maxRetriesServices;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config: AxiosRequestConfig = {
        headers: { ...headers, "X-Action": "SearchAllProject" },
        params:  { page: "1", per_page: "50" },
      };

      const { data, status } = await taskBoardQueryInstance.get<ApiProject[]>(
        "/projects",
        config
      );

      if (status === 204) return [];

      if (!status || status < 200 || status >= 300 || !Array.isArray(data)) {
        throw { message: "Error al obtener los proyectos", status, data };
      }

      return data;
    } catch (error) {
      console.error(`[searchMyProjects] attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error("No se pudieron obtener los proyectos.");
      }
    }
  }

  return [];
}

export { searchMyProjects };

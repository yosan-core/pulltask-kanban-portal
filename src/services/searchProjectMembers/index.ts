import { AxiosRequestConfig } from "axios";
import { maxRetriesServices } from "@config/environment";
import { taskBoardQueryInstance } from "@api/taskBoardQueryInstance";
import type { ApiProjectMember } from "@domain/projectMember";

// Active members of a project (only members of the project can read them)
async function searchProjectMembers(
  projectId: string,
  headers: Record<string, string> = {}
): Promise<ApiProjectMember[]> {
  const maxRetries = maxRetriesServices;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config: AxiosRequestConfig = {
        headers: { ...headers, "X-Action": "SearchAllProjectMember" },
        params:  { projectId, page: "1", per_page: "100" },
      };

      const { data, status } = await taskBoardQueryInstance.get<ApiProjectMember[]>(
        "/project-members",
        config
      );

      if (status === 204) return [];

      if (!status || status < 200 || status >= 300 || !Array.isArray(data)) {
        throw { message: "Error al obtener los miembros", status, data };
      }

      return data.filter((m) => m.projectId === projectId && m.isActive);
    } catch (error) {
      console.error(`[searchProjectMembers] attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error("No se pudieron obtener los miembros del proyecto.");
      }
    }
  }

  return [];
}

export { searchProjectMembers };

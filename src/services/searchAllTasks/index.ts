import { AxiosRequestConfig } from "axios";
import { maxRetriesServices } from "@config/environment";
import { taskBoardQueryInstance } from "@api/taskBoardQueryInstance";
import type { ApiTask } from "@domain/task";

async function searchAllTasks(
  headers: Record<string, string> = {},
  queryParams: Record<string, string> = {}
): Promise<ApiTask[]> {
  const maxRetries = maxRetriesServices;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config: AxiosRequestConfig = {
        headers: { ...headers, "X-Action": "SearchAllTask" },
        params:  { page: "1", per_page: "100", ...queryParams },
      };

      const { data, status } = await taskBoardQueryInstance.get<ApiTask[]>(
        "/tasks",
        config
      );

      if (status === 204) return [];

      if (!status || status < 200 || status >= 300 || !Array.isArray(data)) {
        throw { message: "Error al obtener las tareas", status, data };
      }

      return data;
    } catch (error) {
      console.error(`[searchAllTasks] attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error("No se pudieron obtener las tareas. Verifica que el servicio esté corriendo.");
      }
    }
  }

  return [];
}

export { searchAllTasks };

import { AxiosRequestConfig } from "axios";
import { maxRetriesServices } from "@config/environment";
import { taskBoardCmdInstance } from "@api/taskBoardCmdInstance";
import type { ApiTask } from "@domain/task";

async function updateTaskStatus(
  raw: ApiTask,
  newStatus: string,
  headers: Record<string, string> = {}
): Promise<void> {
  const maxRetries = maxRetriesServices;

  const body = {
    ...raw,
    taskStatus:          newStatus,
    taskUpdatedDate:     new Date().toISOString(),
    modifyJustification: "Status updated via kanban board",
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config: AxiosRequestConfig = {
        headers: { ...headers, "X-Action": "UpdateTask" },
      };

      const { status } = await taskBoardCmdInstance.patch("/tasks", body, config);

      if (!status || status < 200 || status >= 300) {
        throw { message: "Error al actualizar la tarea", status };
      }

      return;
    } catch (error) {
      console.error(`[updateTaskStatus] attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error("No se pudo actualizar el estado de la tarea.");
      }
    }
  }
}

export { updateTaskStatus };

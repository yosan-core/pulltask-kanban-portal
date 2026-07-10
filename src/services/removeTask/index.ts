import { AxiosRequestConfig } from "axios";
import { maxRetriesServices } from "@config/environment";
import { taskBoardCmdInstance } from "@api/taskBoardCmdInstance";

async function removeTask(
  taskId: string,
  headers: Record<string, string> = {}
): Promise<void> {
  const maxRetries = maxRetriesServices;

  const body = {
    removeTask: [{ taskId, removalJustification: "Removed via kanban board" }],
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config: AxiosRequestConfig = {
        headers: { ...headers, "X-Action": "RemoveTask" },
        data: body,
      };

      const { status } = await taskBoardCmdInstance.delete("/tasks", config);

      if (!status || status < 200 || status >= 300) {
        throw { message: "Error al eliminar la tarea", status };
      }

      return;
    } catch (error) {
      console.error(`[removeTask] attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error("No se pudo eliminar la tarea.");
      }
    }
  }
}

export { removeTask };

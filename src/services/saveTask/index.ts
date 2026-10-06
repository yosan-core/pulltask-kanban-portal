import { AxiosRequestConfig } from "axios";
import { maxRetriesServices } from "@config/environment";
import { taskBoardCmdInstance } from "@api/taskBoardCmdInstance";
import type { BoardContext } from "@domain/board";
import type { Task, TaskPriority } from "@domain/task";
import type { AuthUser } from "@domain/task";

// Frontend priority → backend save format
const PRIORITY_TO_API: Record<TaskPriority, string> = {
  LOW:      "Low",
  MEDIUM:   "Medium",
  HIGH:     "High",
  CRITICAL: "Critical",
};

interface SaveTaskPayload {
  board:    BoardContext;
  tasks:    Task[];
  user:     AuthUser;
  title:    string;
  description?: string;
  priority: TaskPriority;
  status:   "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
}

async function saveTask(
  payload: SaveTaskPayload,
  headers: Record<string, string> = {}
): Promise<void> {
  const { board, tasks, user, title, description, priority, status } = payload;

  const columnId = board.columnIdByStatus[status];
  if (!columnId) throw new Error(`No columnId for status ${status}`);

  const now = new Date().toISOString();
  const taskNumber =
    tasks.length > 0
      ? Math.max(...tasks.map((t) => t.taskNumber ?? 0)) + 1
      : 1;
  const colTasks = tasks.filter((t) => t.status === status);
  const taskPosition = colTasks.length > 0
    ? Math.max(...colTasks.map((t) => t.taskPosition)) + 1000
    : 1000;

  const body = {
    taskId:            crypto.randomUUID(),
    boardId:           board.boardId,
    columnId,
    taskNumber,
    taskTitle:         title,
    taskDescription:   description ?? "",
    taskPriority:      PRIORITY_TO_API[priority],
    taskStatus:        status,
    taskPosition,
    createdBy:         user.userAccountId,
    taskCreationDate:  now,
    taskUpdatedDate:   now,
  };

  for (let attempt = 1; attempt <= maxRetriesServices; attempt++) {
    try {
      const config: AxiosRequestConfig = {
        headers: { ...headers, "X-Action": "SaveTask" },
      };

      const { status: httpStatus } = await taskBoardCmdInstance.post(
        "/tasks",
        body,
        config
      );

      if (httpStatus < 200 || httpStatus >= 300) {
        throw new Error(`HTTP ${httpStatus}`);
      }
      return;
    } catch (error) {
      console.error(`[saveTask] attempt ${attempt} failed:`, error);
      if (attempt === maxRetriesServices) {
        throw new Error("No se pudo crear la tarea. Inténtalo de nuevo.");
      }
    }
  }
}

export { saveTask };

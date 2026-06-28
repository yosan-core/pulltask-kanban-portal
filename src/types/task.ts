export type TaskStatus   = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Raw shape returned by task-board-query-process-service
export interface ApiTask {
  taskId:           string;
  boardId:          string;
  columnId:         string;
  taskNumber:       number;
  taskTitle:        string;
  taskDescription?: string;
  taskStatus:       string;
  taskPriority:     string;
  taskPosition:     number;
  createdBy:        string;
  assignedTo?:      string;
  claimedAt?:       string;
  dueDate?:         string;
  estimatedHours?:  number;
  completedAt?:     string;
  taskCreationDate?: string;
  taskUpdatedDate?:  string;
  deletedAt?:        string;
  taskLabels?: Array<{ labelId: string; labelName: string }>;
}

// UI model used by the kanban board
export interface Task {
  taskId:            string;
  title:             string;
  description:       string;
  status:            TaskStatus;
  priority:          TaskPriority;
  taskNumber:        number;
  assigneeName?:     string;
  assigneeInitials?: string;
  dueDate?:          string;
  tags?:             string[];
  createdAt:         string;
  _raw?:             ApiTask;
}

export interface AuthUser {
  userId:    string;
  email:     string;
  names:     string;
  token:     string;
  expiresAt: string;
}

// Mapping helpers
const PRIORITY_MAP: Record<string, TaskPriority> = {
  Low:      "LOW",
  Medium:   "MEDIUM",
  High:     "HIGH",
  Critical: "CRITICAL",
};

const STATUS_VALID = new Set<string>(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);

export function apiTaskToTask(api: ApiTask): Task {
  const status: TaskStatus = STATUS_VALID.has(api.taskStatus)
    ? (api.taskStatus as TaskStatus)
    : "TODO";

  const priority: TaskPriority = PRIORITY_MAP[api.taskPriority] ?? "MEDIUM";

  const tags = api.taskLabels
    ?.filter((l) => l.labelName)
    .map((l) => l.labelName) ?? [];

  const assigneeName   = api.assignedTo ?? undefined;
  const assigneeInitials = assigneeName
    ? assigneeName.slice(0, 2).toUpperCase()
    : undefined;

  return {
    taskId:   api.taskId,
    title:    api.taskTitle,
    description: api.taskDescription ?? "",
    status,
    priority,
    taskNumber: api.taskNumber,
    assigneeName,
    assigneeInitials,
    dueDate:   api.dueDate ? api.dueDate.split("T")[0] : undefined,
    tags:      tags.length > 0 ? tags : undefined,
    createdAt: api.taskCreationDate
      ? api.taskCreationDate.split("T")[0]
      : new Date().toISOString().split("T")[0],
    _raw: api,
  };
}

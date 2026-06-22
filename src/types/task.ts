export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  taskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName?: string;
  assigneeInitials?: string;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  names: string;
  token: string;
  expiresAt: string;
}

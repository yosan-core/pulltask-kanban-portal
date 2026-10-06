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
  taskPosition:      number;
  assigneeName?:     string;
  assigneeInitials?: string;
  assigneeProfilePictureUrl?: string;
  dueDate?:          string;
  tags?:             string[];
  createdAt:         string;
  _raw?:             ApiTask;
}

export interface AuthUser {
  userAccountId:   string;
  userAccountRole: string;
  token:           string;
  expiresAt:       string;
}

// Raw shape returned by auth-query-process-service
export interface ApiUserProfile {
  userAccountId:            string;
  userAccount:              string;
  accountName?:             string;
  names?:                   string;
  surnames?:                string;
  email?:                   string;
  userAccountRole:          string;
  userAccountCreationDate?: string;
  userAccountStatus?:       string;
  mainOriginatorCode?:      string;
  mainOriginatorName?:      string;
  profilePictureUrl?:       string;
}

export interface UserProfile {
  userAccountId:      string;
  userAccount:        string;
  fullName:           string;
  email?:             string;
  role:               string;
  status?:            string;
  mainOriginatorName?: string;
  creationDate?:      string;
  profilePictureUrl?: string;
}

export function apiUserProfileToUserProfile(api: ApiUserProfile): UserProfile {
  const fullName = [api.names, api.surnames].filter(Boolean).join(" ").trim();

  return {
    userAccountId:      api.userAccountId,
    userAccount:        api.userAccount,
    fullName:           fullName || api.accountName || api.userAccount,
    email:              api.email,
    role:               api.userAccountRole,
    status:             api.userAccountStatus,
    mainOriginatorName: api.mainOriginatorName,
    creationDate:       api.userAccountCreationDate ? api.userAccountCreationDate.split("T")[0] : undefined,
    profilePictureUrl:  api.profilePictureUrl,
  };
}

// ─── Update profile picture ────────────────────────────────────────────────

export type ProfilePictureOperation = "Update" | "Delete";

export interface UpdateProfilePicturePayload {
  userAccountId:   string;
  profilePicture?: File;
  operation?:      ProfilePictureOperation;
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
    taskNumber:   api.taskNumber,
    taskPosition: api.taskPosition,
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

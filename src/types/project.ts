import { TaskStatus } from "./task";

export interface ApiColumn {
  columnId:           string;
  projectId:          string;
  columnName:         string;
  columnSlug:         string; // "todo" | "in_progress" | "review" | "done"
  columnPosition:     number;
  columnColor?:       string;
  wipLimit?:          number;
  isLocked:           boolean;
  columnCreationDate?: string;
}

export interface ApiProject {
  projectId:            string;
  organizationId?:      string;
  projectName:          string;
  projectSlug:          string;
  projectDescription?:  string;
  projectStatus:        string;
  createdBy:            string;
  projectCreationDate?: string;
  projectUpdatedDate?:  string;
  projectColumns?:      ApiColumn[];
}

// Derived context used by the kanban UI
export interface ProjectContext {
  projectId:         string;
  projectName:       string;
  createdBy:         string;
  columnIdByStatus:  Record<TaskStatus, string>;
}

const SLUG_TO_STATUS: Record<string, TaskStatus> = {
  todo:        "TODO",
  in_progress: "IN_PROGRESS",
  review:      "REVIEW",
  done:        "DONE",
};

export function apiProjectToProjectContext(project: ApiProject): ProjectContext {
  const columnIdByStatus = {} as Record<TaskStatus, string>;

  for (const col of project.projectColumns ?? []) {
    const status = SLUG_TO_STATUS[col.columnSlug];
    if (status) {
      columnIdByStatus[status] = col.columnId;
    }
  }

  return {
    projectId:        project.projectId,
    projectName:      project.projectName,
    createdBy:        project.createdBy,
    columnIdByStatus,
  };
}

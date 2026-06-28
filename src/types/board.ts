import { TaskStatus } from "./task";

export interface ApiColumn {
  columnId:           string;
  boardId:            string;
  columnName:         string;
  columnSlug:         string; // "todo" | "in_progress" | "review" | "done"
  columnPosition:     number;
  columnColor?:       string;
  wipLimit?:          number;
  isLocked:           boolean;
  columnCreationDate?: string;
}

export interface ApiBoard {
  boardId:            string;
  organizationId:     string;
  boardName:          string;
  boardSlug:          string;
  boardDescription?:  string;
  boardStatus:        string;
  createdBy:          string;
  boardCreationDate?: string;
  boardUpdatedDate?:  string;
  boardColumns?:      ApiColumn[];
}

// Derived context used by the kanban UI
export interface BoardContext {
  boardId:           string;
  boardName:         string;
  createdBy:         string;
  columnIdByStatus:  Record<TaskStatus, string>;
}

const SLUG_TO_STATUS: Record<string, TaskStatus> = {
  todo:        "TODO",
  in_progress: "IN_PROGRESS",
  review:      "REVIEW",
  done:        "DONE",
};

export function apiBoardToBoardContext(board: ApiBoard): BoardContext {
  const columnIdByStatus = {} as Record<TaskStatus, string>;

  for (const col of board.boardColumns ?? []) {
    const status = SLUG_TO_STATUS[col.columnSlug];
    if (status) {
      columnIdByStatus[status] = col.columnId;
    }
  }

  return {
    boardId:          board.boardId,
    boardName:        board.boardName,
    createdBy:        board.createdBy,
    columnIdByStatus,
  };
}

import { Task, TaskStatus } from "@domain/task";
import { ColumnConfig } from "@pages/board/config";
import { TaskCard } from "@components/board/TaskCard";

interface KanbanColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  isDragOver: boolean;
  draggingId: string | null;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragOver: (columnId: TaskStatus) => void;
  onDrop: (targetStatus: TaskStatus) => void;
  onCardClick: (taskId: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  isDragOver,
  draggingId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onCardClick,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-72 flex-shrink-0 rounded-lg border border-gh-border bg-gh-bg overflow-hidden">
      {/* Header — tono más claro que el body */}
      <div className="px-3 pt-3 pb-0 bg-[#21262d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${column.dotColor}`} />
            <span className="text-sm font-semibold text-gh-text">{column.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${column.countBg}`}>
              {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="text-gh-muted hover:text-gh-text w-6 h-6 flex items-center justify-center rounded hover:bg-gh-card transition-colors text-xs">
              •••
            </button>
            <button className="text-gh-muted hover:text-gh-text w-6 h-6 flex items-center justify-center rounded hover:bg-gh-card transition-colors font-bold">
              +
            </button>
          </div>
        </div>
        {column.subtitle && (
          <p className="text-[11px] text-gh-muted mt-1 pl-[18px]">{column.subtitle}</p>
        )}

        {/* Accent bar */}
        <div
          className={`h-[2px] rounded-full mt-3 transition-colors duration-150 ${
            isDragOver && draggingId ? "bg-gh-blue" : column.accentColor
          }`}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); onDragOver(column.id); }}
        onDrop={(e) => { e.preventDefault(); onDrop(column.id); }}
        className="flex flex-col gap-2 flex-1 overflow-y-auto p-3 min-h-24"
      >
        {tasks.length === 0 ? (
          <div
            className={`flex items-center justify-center h-20 rounded-lg border border-dashed transition-colors ${
              isDragOver && draggingId ? "border-gh-blue bg-gh-blueDim" : "border-gh-border"
            }`}
          >
            <p className="text-xs text-gh-muted">Sin tareas</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.taskId}
              task={task}
              isDragging={draggingId === task.taskId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

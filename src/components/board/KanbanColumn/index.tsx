import { Task, TaskStatus } from "@domain/task";
import { ColumnConfig } from "@pages/board/config";
import { TaskCard } from "@components/board/TaskCard";

interface KanbanColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  isDragOver: boolean;
  draggingId: string | null;
  dragOverCardId: string | null;
  dragPosition: "top" | "bottom" | null;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragOver: (columnId: TaskStatus) => void;
  onDragOverCard: (cardId: string, pos: "top" | "bottom") => void;
  onDrop: (targetStatus: TaskStatus) => void;
  onCardClick: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  isDragOver,
  draggingId,
  dragOverCardId,
  dragPosition,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragOverCard,
  onDrop,
  onCardClick,
  onRemoveTask,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-96 flex-shrink-0 rounded-lg border border-gh-border bg-gh-bg overflow-hidden">
      {/* Header — tono más claro que el body */}
      <div className="px-3 pt-1 pb-0 bg-[#000000]"> {/*21262d*/}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 bg-[#21262d] ${column.dotColor}`} />
            <span className="text-sm font-semibold text-gh-text">{column.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${column.countBg}`}>
              {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-">
            <button className="text-gh-muted hover:text-gh-text w-6 h-6 flex items-center justify-center rounded hover:bg-gh-card transition-colors text-xs">
              •••
            </button>
            <button className="text-gh-muted hover:text-gh-text w-6 h-6 flex items-center justify-center rounded hover:bg-gh-card transition-colors font-bold">
              +
            </button>
          </div>
        </div>
        {column.subtitle && (
          <p className="text-[12px] text-gh-muted mt-0 pl-[18px]">{column.subtitle}</p>
        )}

        {/* Accent bar */}
        <div
          className={`h-[2px] rounded-full mt-1 transition-colors duration-150 ${
            isDragOver && draggingId ? "bg-gh-blue" : "bg-transparent" /*column.accentColor*/
          }`}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); onDragOver(column.id); }}
        onDrop={(e) => { e.preventDefault(); onDrop(column.id); }}
        className="flex flex-col gap-2 flex-1 overflow-y-auto p-3 min-h-24 bg-[#000000]"
      >
        {tasks.length === 0 ? null : (
          <>
            {tasks.map((task, index) => {
              const showLineBefore =
                (dragOverCardId === task.taskId && dragPosition === "top") ||
                (index > 0 && dragOverCardId === tasks[index - 1].taskId && dragPosition === "bottom");

              return (
                <div key={task.taskId}>
                  {showLineBefore && <div className="h-[2px] bg-blue-500 rounded-full mb-1" />}
                  <TaskCard
                    task={task}
                    isDragging={draggingId === task.taskId}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onClick={onCardClick}
                    onDragOverCard={onDragOverCard}
                    onRemove={onRemoveTask}
                  />
                </div>
              );
            })}
            {dragOverCardId === tasks[tasks.length - 1].taskId && dragPosition === "bottom" && (
              <div className="h-[2px] bg-blue-500 rounded-full mt-1" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

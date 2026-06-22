import { Task, TaskPriority } from "@types/task";

const priorityColor: Record<TaskPriority, string> = {
  HIGH:   "text-red-400",
  MEDIUM: "text-yellow-400",
  LOW:    "text-green-400",
};

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onClick: (taskId: string) => void;
}

export function TaskCard({ task, isDragging, onDragStart, onDragEnd, onClick }: TaskCardProps) {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(task.taskId); }}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task.taskId)}
      className={`card-in rounded-lg p-3 border select-none cursor-pointer
                  transition-all duration-150
                  ${isDragging
                    ? "border-gh-blue ring-1 ring-gh-blue bg-[#21262d] opacity-60"
                    : "border-gh-border bg-[#21262d] hover:border-gh-muted"
                  }`}
    >
      {/* Task ID — círculo verde outline (GitHub open-issue style) + ID */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {/* Círculo borde verde con dot interior — igual para todas las columnas */}
          <div className="w-3.5 h-3.5 rounded-full border-2 border-green-400 flex items-center justify-center flex-shrink-0">
            <div className="w-1 h-1 rounded-full bg-green-400" />
          </div>
          <span className="text-[11px] text-gh-muted font-mono">
            pulltask <span className={`font-semibold ${priorityColor[task.priority]}`}>#{task.taskId}</span>
          </span>
        </div>
        {task.assigneeInitials && (
          <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-[8px] font-bold flex items-center justify-center">
            {task.assigneeInitials}
          </div>
        )}
      </div>

      {/* Title */}
      <p className="text-sm text-gh-text leading-snug mb-2">{task.title}</p>

      {/* Tags + due date */}
      <div className="flex items-center justify-between flex-wrap gap-1 mt-1">
        <div className="flex flex-wrap gap-1">
          {task.tags?.map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full border border-gh-border text-gh-muted">
              {tag}
            </span>
          ))}
        </div>
        {task.dueDate && (
          <span className={`text-[10px] ${isOverdue ? "text-red-400 font-semibold" : "text-gh-muted"}`}>
            {new Date(task.dueDate).toLocaleDateString("es", { day: "2-digit", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}

import { Task, TaskStatus } from "@types/task";
import { COLUMNS } from "./config";
import { KanbanColumn } from "@components/board/KanbanColumn";
import { TaskDetail } from "@components/board/TaskDetail";
import { useAuthContext } from "@context/authContext";

interface BoardUIProps {
  tasks: Task[];
  projectName: string;
  draggingId: string | null;
  dragOverColumn: TaskStatus | null;
  selectedTask: Task | null;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragOverColumn: (columnId: TaskStatus) => void;
  onDrop: (targetStatus: TaskStatus) => void;
  onCardClick: (taskId: string) => void;
  onCloseDetail: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function BoardUI({
  tasks,
  projectName,
  draggingId,
  dragOverColumn,
  selectedTask,
  onDragStart,
  onDragEnd,
  onDragOverColumn,
  onDrop,
  onCardClick,
  onCloseDetail,
  onStatusChange,
}: BoardUIProps) {
  const { user, signOut } = useAuthContext();

  const initials = user?.names
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gh-surface">

      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-2 bg-gh-surface border-b border-gh-border flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gh-muted">
          <span className="font-black text-base">
            <span className="text-gh-muted">pull</span>
            <span className="text-brand-500">Task</span>
          </span>
          <span>/</span>
          <span className="text-gh-text font-semibold">Projects</span>
          <span>/</span>
          <span className="text-gh-text font-semibold">{projectName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={signOut} className="text-xs text-gh-muted hover:text-gh-text transition-colors">
            Cerrar sesión
          </button>
          <div className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
            {initials}
          </div>
        </div>
      </header>

      {/* Project title + tabs */}
      <div className="px-6 py-4 border-b border-gh-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gh-text">{projectName}</h1>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gh-blue text-white text-sm font-medium hover:brightness-110 transition-all">
            + Nueva tarea
          </button>
        </div>
        <div className="flex items-center gap-1">
          {["Sprint 1", "Sprint 2"].map((sprint, i) => (
            <button
              key={sprint}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-sm transition-colors ${
                i === 0
                  ? "bg-gh-card border border-gh-border text-gh-text"
                  : "text-gh-muted hover:text-gh-text hover:bg-gh-card"
              }`}
            >
              <span className="text-[11px]">⊞</span>
              {sprint}
            </button>
          ))}
          <button className="px-3 py-1 text-sm text-gh-muted hover:text-gh-text transition-colors">
            + Nueva vista
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 py-2 border-b border-gh-border flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gh-border bg-gh-surface max-w-md">
          <svg className="w-3.5 h-3.5 text-gh-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Filtrar por palabra clave o campo"
            className="bg-transparent text-sm text-gh-muted placeholder-gh-muted outline-none w-full"
          />
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 px-6 py-4 h-full">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasks.filter((t) => t.status === col.id)}
              isDragOver={dragOverColumn === col.id}
              draggingId={draggingId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOverColumn}
              onDrop={onDrop}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </div>

      {/* Panel lateral de detalle */}
      <TaskDetail
        task={selectedTask}
        onClose={onCloseDetail}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}

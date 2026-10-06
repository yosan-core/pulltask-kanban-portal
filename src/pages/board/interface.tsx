import { Task, TaskStatus } from "@domain/task";
import { BoardContext } from "@domain/board";
import { COLUMNS } from "./config";
import { KanbanColumn } from "@components/board/KanbanColumn";
import { TaskDetail } from "@components/board/TaskDetail";
import { NewTaskForm } from "@components/board/NewTaskForm";
import { ProfileMenu } from "@components/layout/ProfileMenu";
import { useAuthContext } from "@context/authContext";

interface BoardUIProps {
  tasks:            Task[];
  board:            BoardContext | null;
  projectName:      string;
  serviceError:     string | null;
  draggingId:       string | null;
  dragOverColumn:   TaskStatus | null;
  dragOverCardId:   string | null;
  dragPosition:     "top" | "bottom" | null;
  selectedTask:     Task | null;
  showNewTask:      boolean;
  onDragStart:      (taskId: string) => void;
  onDragEnd:        () => void;
  onDragOverColumn: (columnId: TaskStatus) => void;
  onDragOverCard:   (cardId: string, pos: "top" | "bottom") => void;
  onDrop:           (targetStatus: TaskStatus) => void;
  onCardClick:      (taskId: string) => void;
  onRemoveTask:     (taskId: string) => void;
  onCloseDetail:    () => void;
  onStatusChange:   (taskId: string, newStatus: TaskStatus) => void;
  onSaveTask:       (taskId: string, updates: { title?: string; description?: string; priority?: string; dueDate?: string; assigneeName?: string }) => void;
  newTaskStatus:    TaskStatus | null;
  onAddClick:       (columnId: TaskStatus) => void;
  onCloseNewTask:   () => void;
  onTaskSaved:      () => void;
}

export function BoardUI({
  tasks,
  board,
  projectName,
  serviceError,
  draggingId,
  dragOverColumn,
  dragOverCardId,
  dragPosition,
  selectedTask,
  showNewTask,
  onDragStart,
  onDragEnd,
  onDragOverColumn,
  onDragOverCard,
  onDrop,
  onCardClick,
  onRemoveTask,
  onCloseDetail,
  onStatusChange,
  onSaveTask,
  newTaskStatus,
  onAddClick,
  onCloseNewTask,
  onTaskSaved,
}: BoardUIProps) {
  const { user } = useAuthContext();

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
          <ProfileMenu />
        </div>
      </header>

      {/* Project title + tabs */}
      <div className="px-6 py-4 border-b border-gh-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gh-text">{projectName}</h1>
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

      {/* Error banner */}
      {serviceError && (
        <div className="px-6 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">{serviceError} — verifica que los servicios estén corriendo.</p>
        </div>
      )}

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
              dragOverCardId={dragOverCardId}
              dragPosition={dragPosition}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOverColumn}
              onDragOverCard={onDragOverCard}
              onDrop={onDrop}
              onCardClick={onCardClick}
              onRemoveTask={onRemoveTask}
              onAddClick={onAddClick}
            />
          ))}
        </div>
      </div>

      {/* Panel lateral de detalle */}
      <TaskDetail
        task={selectedTask}
        onClose={onCloseDetail}
        onStatusChange={onStatusChange}
        onSaveTask={onSaveTask}
      />

      {/* Panel de nueva tarea */}
      <NewTaskForm
        open={showNewTask}
        board={board}
        tasks={tasks}
        user={user}
        defaultStatus={newTaskStatus ?? undefined}
        onClose={onCloseNewTask}
        onSaved={onTaskSaved}
      />
    </div>
  );
}

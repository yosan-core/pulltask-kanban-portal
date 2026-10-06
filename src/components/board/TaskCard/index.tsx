import { useState, useEffect, useRef } from "react";
import { Task, TaskPriority } from "@domain/task";

const priorityConfig: Record<TaskPriority, { label: string; badge: string }> = {
  CRITICAL: { label: "Crítica", badge: "bg-red-600/15 text-red-400 border-red-600/40" },
  HIGH:     { label: "Alta",    badge: "bg-red-400/15 text-red-300 border-red-400/40" },
  MEDIUM:   { label: "Media",   badge: "bg-yellow-400/15 text-yellow-300 border-yellow-400/40" },
  LOW:      { label: "Baja",    badge: "bg-green-400/15 text-green-300 border-green-400/40" },
};

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onClick: (taskId: string) => void;
  onDragOverCard: (cardId: string, pos: "top" | "bottom") => void;
  onRemove: (taskId: string) => void;
}

export function TaskCard({ task, isDragging, onDragStart, onDragEnd, onClick, onDragOverCard, onRemove }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
  const [showMenu,    setShowMenu]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showMenu]);

  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(task.taskId); }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const pos: "top" | "bottom" = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom";
        onDragOverCard(task.taskId, pos);
      }}
      className={`group card-in rounded-lg p-3 border select-none cursor-grab
                  transition-all duration-150
                  ${isDragging
                    ? "border-gh-blue ring-1 ring-gh-blue bg-[#21262d] opacity-60"
                    : "border-gh-border bg-[#21262d] hover:border-gh-muted"
                  }`}
    >
      {/* Header row: circle + ID + menu */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-green-400 flex items-center justify-center flex-shrink-0">
            <div className="w-1 h-1 rounded-full bg-green-400" />
          </div>
          <span className="text-[11px] text-gh-muted font-mono">
            pulltask <span className="font-semibold">#{task.taskNumber}</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Menú ••• */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gh-muted hover:text-gh-text w-5 h-5 flex items-center justify-center rounded hover:bg-gh-card text-xs"
            >
              •••
            </button>

            {showMenu && (
              <div className="absolute right-0 top-6 z-50 w-44 rounded-lg border border-gh-border bg-[#161b22] shadow-xl py-1">
                {/* Edit */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onClick(task.taskId); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gh-text hover:bg-gh-card flex items-center gap-2 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gh-muted flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Edit
                </button>

                <div className="border-t border-gh-border my-1" />

                {/* Remove */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); setShowConfirm(true); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  Remove
                </button>
              </div>
            )}
          </div>

          {task.assigneeInitials && (
            <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-[8px] font-bold flex items-center justify-center overflow-hidden">
              {task.assigneeProfilePictureUrl ? (
                <img src={task.assigneeProfilePictureUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                task.assigneeInitials
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
        >
          <div
            className="bg-[#161b22] border border-gh-border rounded-lg shadow-xl w-80 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gh-text">Remove item?</span>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gh-muted hover:text-gh-text transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <p className="text-sm text-gh-muted mb-5">
              Are you sure you want to remove this item from this project?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 text-sm text-gh-text bg-gh-card border border-gh-border rounded-md hover:brightness-110 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirm(false); onRemove(task.taskId); }}
                className="px-3 py-1.5 text-sm text-red-400 border border-red-500 rounded-md hover:bg-red-500/10 transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <p className="text-sm text-gh-text leading-snug mb-2">
        <span
          onClick={(e) => { e.stopPropagation(); onClick(task.taskId); }}
          className="cursor-pointer hover:text-gh-blue hover:underline transition-colors"
        >
          {task.title}
        </span>
      </p>

      {/* Tags + due date */}
      <div className="flex items-center justify-between flex-wrap gap-1 mt-1">
        <div className="flex flex-wrap gap-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${priorityConfig[task.priority].badge}`}>
            {priorityConfig[task.priority].label}
          </span>
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

import { Task, TaskStatus, TaskPriority } from "@types/task";
import { COLUMNS } from "@pages/board/config";

const priorityConfig: Record<TaskPriority, { label: string; dot: string }> = {
  HIGH:   { label: "Alta",  dot: "bg-red-400" },
  MEDIUM: { label: "Media", dot: "bg-yellow-400" },
  LOW:    { label: "Baja",  dot: "bg-green-400" },
};

const statusConfig: Record<TaskStatus, { label: string; dot: string }> = {
  TODO:        { label: "Por hacer",    dot: "bg-blue-500" },
  IN_PROGRESS: { label: "En progreso",  dot: "bg-yellow-400" },
  REVIEW:      { label: "En revisión",  dot: "bg-purple-400" },
  DONE:        { label: "Completado",   dot: "bg-green-500" },
};

interface TaskDetailProps {
  task: Task | null;
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskDetail({ task, onClose, onStatusChange }: TaskDetailProps) {
  const isOpen = task !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-[460px] z-50 flex flex-col
                    bg-gh-surface border-l border-gh-border
                    transition-transform duration-200 ease-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {task && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gh-border">
              <div>
                <span className="text-[11px] font-mono text-gh-muted">#{task.taskId}</span>
                <h2 className="text-base font-semibold text-gh-text mt-1 leading-snug">
                  {task.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gh-muted hover:text-gh-text transition-colors mt-1 ml-4 flex-shrink-0 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Metadata */}
              <div className="space-y-3">
                <Row label="Estado">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusConfig[task.status].dot}`} />
                    <span className="text-sm text-gh-text">{statusConfig[task.status].label}</span>
                  </div>
                </Row>

                <Row label="Prioridad">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${priorityConfig[task.priority].dot}`} />
                    <span className="text-sm text-gh-text">{priorityConfig[task.priority].label}</span>
                  </div>
                </Row>

                {task.assigneeName && (
                  <Row label="Asignado">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {task.assigneeInitials}
                      </div>
                      <span className="text-sm text-gh-text">{task.assigneeName}</span>
                    </div>
                  </Row>
                )}

                {task.dueDate && (
                  <Row label="Vence">
                    <span className={`text-sm ${
                      new Date(task.dueDate) < new Date() && task.status !== "DONE"
                        ? "text-red-400 font-medium"
                        : "text-gh-text"
                    }`}>
                      {new Date(task.dueDate).toLocaleDateString("es", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </span>
                  </Row>
                )}

                {task.createdAt && (
                  <Row label="Creado">
                    <span className="text-sm text-gh-muted">
                      {new Date(task.createdAt).toLocaleDateString("es", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </span>
                  </Row>
                )}
              </div>

              <Divider />

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-gh-muted uppercase tracking-wider mb-2">
                  Descripción
                </p>
                <p className="text-sm text-gh-text leading-relaxed">
                  {task.description || <span className="text-gh-muted italic">Sin descripción</span>}
                </p>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <p className="text-xs font-semibold text-gh-muted uppercase tracking-wider mb-2">
                      Etiquetas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full border border-gh-border text-gh-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Divider />

              {/* Move to */}
              <div>
                <p className="text-xs font-semibold text-gh-muted uppercase tracking-wider mb-3">
                  Mover a
                </p>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.filter((c) => c.id !== task.status).map((col) => (
                    <button
                      key={col.id}
                      onClick={() => onStatusChange(task.taskId, col.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                                 border border-gh-border text-gh-muted bg-gh-card
                                 hover:border-gh-blue hover:text-gh-blue transition-colors"
                    >
                      <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-gh-muted w-20 flex-shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gh-border" />;
}

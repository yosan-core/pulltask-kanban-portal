import { useState, useEffect, useRef } from "react";
import { Task, TaskStatus, TaskPriority } from "@domain/task";
import { COLUMNS } from "@pages/board/config";

const priorityConfig: Record<TaskPriority, { label: string; dot: string; badge: string }> = {
  CRITICAL: { label: "Crítica",  dot: "bg-red-600",    badge: "bg-red-600/20 text-red-400 border-red-600/40" },
  HIGH:     { label: "Alta",     dot: "bg-red-400",    badge: "bg-red-400/20 text-red-300 border-red-400/40" },
  MEDIUM:   { label: "Media",    dot: "bg-yellow-400", badge: "bg-yellow-400/20 text-yellow-300 border-yellow-400/40" },
  LOW:      { label: "Baja",     dot: "bg-green-400",  badge: "bg-green-400/20 text-green-300 border-green-400/40" },
};

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "CRITICAL", label: "Crítica" },
  { value: "HIGH",     label: "Alta" },
  { value: "MEDIUM",   label: "Media" },
  { value: "LOW",      label: "Baja" },
];

const statusConfig: Record<TaskStatus, { label: string; icon: string; cls: string }> = {
  TODO:        { label: "Por hacer",   icon: "○", cls: "bg-blue-600/20 text-blue-400 border-blue-600/40" },
  IN_PROGRESS: { label: "En progreso", icon: "◑", cls: "bg-yellow-400/20 text-yellow-300 border-yellow-400/40" },
  REVIEW:      { label: "En revisión", icon: "◎", cls: "bg-purple-400/20 text-purple-300 border-purple-400/40" },
  DONE:        { label: "Completado",  icon: "●", cls: "bg-green-600/20 text-green-400 border-green-600/40" },
};

interface TaskDetailProps {
  task: Task | null;
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onSaveTask: (taskId: string, updates: { title?: string; description?: string; priority?: string; dueDate?: string }) => void;
}

export function TaskDetail({ task, onClose, onStatusChange, onSaveTask }: TaskDetailProps) {
  const isOpen = task !== null;

  /* ── title inline edit ── */
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft,   setTitleDraft]   = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  /* ── description edit ── */
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft,   setDescDraft]   = useState("");

  /* ── sidebar fields ── */
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate,  setDueDate]  = useState("");

  /* reset when task changes */
  useEffect(() => {
    if (task) {
      setTitleDraft(task.title);
      setDescDraft(task.description ?? "");
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
      setEditingTitle(false);
      setEditingDesc(false);
    }
  }, [task?.taskId]);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  const saveTitle = () => {
    if (!task) return;
    onSaveTask(task.taskId, { title: titleDraft });
    setEditingTitle(false);
  };

  const saveDesc = () => {
    if (!task) return;
    onSaveTask(task.taskId, { description: descDraft });
    setEditingDesc(false);
  };

  const savePriority = (p: TaskPriority) => {
    if (!task) return;
    setPriority(p);
    onSaveTask(task.taskId, { priority: p });
  };

  const saveDueDate = (d: string) => {
    if (!task) return;
    setDueDate(d);
    onSaveTask(task.taskId, { dueDate: d || undefined });
  };

  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task?.status !== "DONE";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer — wider to fit two columns */}
      <div
        className={`fixed inset-y-0 right-0 w-[720px] z-50 flex flex-col
                    bg-[#0d1117] border-l border-gh-border
                    transition-transform duration-200 ease-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {task && (
          <>
            {/* ── Top bar ── */}
            <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-gh-border flex-shrink-0">
              <div className="flex-1 min-w-0">
                {/* Title row */}
                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={titleInputRef}
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                      className="flex-1 bg-[#161b22] border border-gh-blue rounded-md px-3 py-1.5
                                 text-base font-semibold text-gh-text outline-none"
                    />
                    <button onClick={saveTitle} className="px-3 py-1.5 text-sm text-white bg-gh-blue rounded-md hover:brightness-110 transition-all">
                      Guardar
                    </button>
                    <button onClick={() => { setTitleDraft(task.title); setEditingTitle(false); }}
                            className="px-3 py-1.5 text-sm text-gh-muted hover:text-gh-text transition-colors">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gh-text leading-snug">
                      {task.title}
                      <span className="text-gh-muted font-normal ml-2">#{task.taskNumber}</span>
                    </h2>
                    <button
                      onClick={() => setEditingTitle(true)}
                      className="text-gh-muted hover:text-gh-text transition-colors flex items-center justify-center w-6 h-6 rounded flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  </div>
                )}

                {/* Status + type badges */}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[task.status].cls}`}>
                    <span>{statusConfig[task.status].icon}</span>
                    {statusConfig[task.status].label}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#9e6a03]/50 bg-[#9e6a03]/20 text-[#e3b341]">
                    Task
                  </span>
                  {task.createdAt && (
                    <span className="text-xs text-gh-muted">
                      abierto {new Date(task.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>

              {/* Close */}
              <button onClick={onClose} className="text-gh-muted hover:text-gh-text transition-colors mt-1 flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* ── Body: left content + right sidebar ── */}
            <div className="flex flex-1 overflow-hidden">

              {/* Left — description / comments */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* Description box */}
                <div className="flex gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {task.assigneeInitials ?? "?"}
                  </div>

                  <div className="flex-1 border border-gh-border rounded-lg overflow-hidden">
                    {/* Box header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-gh-border">
                      <span className="text-xs text-gh-muted">
                        {task.assigneeName ?? "Sin asignar"}
                        {task.createdAt && (
                          <span> · {new Date(task.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short" })}</span>
                        )}
                      </span>
                      {!editingDesc && (
                        <button
                          onClick={() => { setDescDraft(task.description ?? ""); setEditingDesc(true); }}
                          className="text-gh-muted hover:text-gh-text transition-colors"
                          title="Editar descripción"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Box body */}
                    <div className="bg-[#0d1117] px-4 py-4 min-h-[120px]">
                      {editingDesc ? (
                        <>
                          <textarea
                            value={descDraft}
                            onChange={(e) => setDescDraft(e.target.value)}
                            rows={5}
                            autoFocus
                            className="w-full bg-[#161b22] border border-gh-border rounded-md px-3 py-2
                                       text-sm text-gh-text outline-none focus:border-gh-blue
                                       transition-colors resize-none"
                            placeholder="Agrega una descripción…"
                          />
                          <div className="flex justify-end gap-2 mt-3">
                            <button
                              onClick={() => setEditingDesc(false)}
                              className="px-3 py-1.5 text-sm text-gh-muted hover:text-gh-text transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={saveDesc}
                              className="px-3 py-1.5 text-sm text-white bg-gh-blue rounded-md hover:brightness-110 transition-all"
                            >
                              Guardar
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gh-text leading-relaxed whitespace-pre-wrap">
                          {task.description || <span className="text-gh-muted italic">Sin descripción</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="pl-11">
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-gh-border text-gh-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="w-56 flex-shrink-0 border-l border-gh-border overflow-y-auto px-4 py-5 space-y-5">

                {/* Assignees */}
                <SideSection label="Assignees" icon={
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                }>
                  {task.assigneeName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                        {task.assigneeInitials}
                      </div>
                      <span className="text-xs text-gh-text">{task.assigneeName}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gh-muted mt-1">Sin asignar</p>
                  )}
                </SideSection>

                <Divider />

                {/* Labels / Priority */}
                <SideSection label="Prioridad" icon={
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>
                  </svg>
                }>
                  <div className="mt-2 space-y-1.5">
                    {PRIORITY_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => savePriority(o.value)}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors
                          ${priority === o.value
                            ? "bg-gh-card border border-gh-blue text-gh-text"
                            : "text-gh-muted hover:bg-gh-card hover:text-gh-text"
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig[o.value].dot}`} />
                        {o.label}
                        {priority === o.value && (
                          <svg className="w-3 h-3 ml-auto text-gh-blue" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </SideSection>

                <Divider />

                {/* Due date */}
                <SideSection label="Fecha límite" icon={
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>
                  </svg>
                }>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => saveDueDate(e.target.value)}
                    className={`mt-1 w-full bg-gh-card border border-gh-border rounded-md px-2 py-1 text-xs
                               outline-none focus:border-gh-blue transition-colors
                               ${isOverdue ? "text-red-400" : "text-gh-text"}`}
                  />
                </SideSection>

                <Divider />

                {/* Move to */}
                <SideSection label="Mover a" icon={
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
                  </svg>
                }>
                  <div className="mt-2 space-y-1.5">
                    {COLUMNS.filter((c) => c.id !== task.status).map((col) => (
                      <button
                        key={col.id}
                        onClick={() => onStatusChange(task.taskId, col.id)}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs
                                   text-gh-muted hover:bg-gh-card hover:text-gh-text transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 border ${col.dotColor}`} />
                        {col.label}
                      </button>
                    ))}
                  </div>
                </SideSection>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function SideSection({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gh-muted uppercase tracking-wider">
        <span className="text-gh-muted">{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gh-border" />;
}

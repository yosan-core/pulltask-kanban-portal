import { useState, useEffect, FormEvent } from "react";
import { TaskPriority, TaskStatus, Task, AuthUser } from "@domain/task";
import { BoardContext } from "@domain/board";
import { saveTask } from "@services/saveTask";
import { useHeaders } from "@hooks/useHeaders";

interface NewTaskFormProps {
  open:          boolean;
  board:         BoardContext | null;
  tasks:         Task[];
  user:          AuthUser | null;
  defaultStatus?: TaskStatus;
  onClose:       () => void;
  onSaved:       () => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "LOW",      label: "Baja"    },
  { value: "MEDIUM",   label: "Media"   },
  { value: "HIGH",     label: "Alta"    },
  { value: "CRITICAL", label: "Crítica" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO",        label: "Por hacer"    },
  { value: "IN_PROGRESS", label: "En progreso"  },
  { value: "REVIEW",      label: "En revisión"  },
  { value: "DONE",        label: "Completado"   },
];

export function NewTaskForm({ open, board, tasks, user, defaultStatus, onClose, onSaved }: NewTaskFormProps) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [priority,    setPriority]    = useState<TaskPriority>("MEDIUM");
  const [status,      setStatus]      = useState<TaskStatus>("TODO");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const { getHeaders } = useHeaders();

  useEffect(() => {
    if (open) setStatus(defaultStatus ?? "TODO");
  }, [open, defaultStatus]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!board || !user) {
      setError("Contexto de tablero no disponible.");
      return;
    }
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveTask(
        { board, tasks, user, title: title.trim(), description: description.trim() || undefined, priority, status },
        getHeaders()
      );
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setStatus("TODO");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la tarea.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] max-h-[85vh] bg-gh-card border border-gh-border rounded-lg shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gh-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-gh-text">Nueva tarea</h2>
          <button
            onClick={onClose}
            className="text-gh-muted hover:text-gh-text transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gh-muted uppercase tracking-wide">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              placeholder="¿Qué hay que hacer?"
              className="bg-gh-surface border border-gh-border rounded-md px-3 py-2 text-sm text-gh-text placeholder-gh-muted outline-none focus:border-gh-blue transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gh-muted uppercase tracking-wide">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalle opcional…"
              rows={4}
              className="bg-gh-surface border border-gh-border rounded-md px-3 py-2 text-sm text-gh-text placeholder-gh-muted outline-none focus:border-gh-blue transition-colors resize-none"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gh-muted uppercase tracking-wide">
              Prioridad
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="bg-gh-surface border border-gh-border rounded-md px-3 py-2 text-sm text-gh-text outline-none focus:border-gh-blue transition-colors"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Status (column) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gh-muted uppercase tracking-wide">
              Columna
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="bg-gh-surface border border-gh-border rounded-md px-3 py-2 text-sm text-gh-text outline-none focus:border-gh-blue transition-colors"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-md border border-gh-border text-sm text-gh-muted hover:text-gh-text hover:border-gh-text transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1 px-4 py-2 rounded-md bg-gh-blue text-white text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creando…" : "Crear tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

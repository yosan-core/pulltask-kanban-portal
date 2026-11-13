import { useState, FormEvent } from "react";
import type { ApiProject } from "@domain/project";
import { ProfileMenu } from "@components/layout/ProfileMenu";

interface ProjectsUIProps {
  projects:      ApiProject[];
  loading:       boolean;
  error:         string | null;
  showForm:      boolean;
  creating:      boolean;
  createError:   string | null;
  onNewProject:  () => void;
  onCancelForm:  () => void;
  onCreate:      (name: string, description: string) => void;
  onOpenProject: (projectId: string) => void;
}

export function ProjectsUI({
  projects,
  loading,
  error,
  showForm,
  creating,
  createError,
  onNewProject,
  onCancelForm,
  onCreate,
  onOpenProject,
}: ProjectsUIProps) {
  const isEmpty = !loading && !error && projects.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-gh-surface">
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-2 bg-gh-surface border-b border-gh-border">
        <div className="flex items-center gap-2 text-sm text-gh-muted">
          <span className="font-black text-base">
            <span className="text-gh-muted">pull</span>
            <span className="text-brand-500">Task</span>
          </span>
          <span>/</span>
          <span className="text-gh-text font-semibold">Projects</span>
        </div>
        <ProfileMenu />
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-lg font-semibold text-gh-text">Mis proyectos</h1>
          {!showForm && !isEmpty && (
            <button
              onClick={onNewProject}
              className="px-3 py-1.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
            >
              + Nuevo proyecto
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {showForm && (
          <NewProjectForm
            isFirst={isEmpty}
            creating={creating}
            error={createError}
            onCancel={isEmpty ? undefined : onCancelForm}
            onCreate={onCreate}
          />
        )}

        {loading ? (
          <p className="text-sm text-gh-muted">Cargando proyectos…</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li key={project.projectId}>
                <button
                  onClick={() => onOpenProject(project.projectId)}
                  className="w-full h-full text-left rounded-lg border border-gh-border bg-gh-card px-4 py-3 hover:border-brand-500 transition-colors"
                >
                  <p className="text-sm font-semibold text-gh-text truncate">{project.projectName}</p>
                  <p className="mt-1 text-xs text-gh-muted line-clamp-2 min-h-[2rem]">
                    {project.projectDescription || "Sin descripción"}
                  </p>
                  {project.projectCreationDate && (
                    <p className="mt-2 text-[11px] text-gh-muted">
                      Creado el {new Date(project.projectCreationDate).toLocaleDateString()}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

interface NewProjectFormProps {
  isFirst:   boolean;
  creating:  boolean;
  error:     string | null;
  onCancel?: () => void;
  onCreate:  (name: string, description: string) => void;
}

function NewProjectForm({ isFirst, creating, error, onCancel, onCreate }: NewProjectFormProps) {
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onCreate(name, description);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gh-border bg-gh-card p-4 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-gh-text">
          {isFirst ? "Crea tu primer proyecto" : "Nuevo proyecto"}
        </h2>
        {isFirst && (
          <p className="mt-1 text-xs text-gh-muted">
            Tus proyectos solo los ven las personas que tú agregues.
          </p>
        )}
      </div>

      <label className="block">
        <span className="block text-xs text-gh-muted mb-1">Nombre</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          autoFocus
          placeholder="Ej: Mi emprendimiento"
          disabled={creating}
          className="w-full rounded-md border border-gh-border bg-gh-surface px-3 py-2 text-sm text-gh-text placeholder:text-gh-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </label>

      <label className="block">
        <span className="block text-xs text-gh-muted mb-1">Descripción (opcional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          disabled={creating}
          className="w-full rounded-md border border-gh-border bg-gh-surface px-3 py-2 text-sm text-gh-text focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </label>

      {error && <p className="text-xs text-red-300">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={creating}
            className="px-3 py-1.5 rounded-md text-sm text-gh-muted hover:text-gh-text"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={creating}
          className="px-3 py-1.5 rounded-md bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {creating ? "Creando…" : "Crear proyecto"}
        </button>
      </div>
    </form>
  );
}

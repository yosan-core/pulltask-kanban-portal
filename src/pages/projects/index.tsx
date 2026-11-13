import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyProjects } from "@hooks/useMyProjects";
import { useHeaders } from "@hooks/useHeaders";
import { saveProject } from "@services/saveProject";
import { ProjectsUI } from "./interface";

export function ProjectsPage() {
  const { projects, loading, error } = useMyProjects();
  const { getHeaders } = useHeaders();
  const navigate = useNavigate();

  const [showForm,    setShowForm]    = useState(false);
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async (name: string, description: string) => {
    if (!name.trim()) {
      setCreateError("El nombre del proyecto es obligatorio.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const created = await saveProject(
        { projectName: name.trim(), projectDescription: description.trim() || undefined },
        getHeaders()
      );
      navigate(`/projects/${created.projectId}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "No se pudo crear el proyecto.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <ProjectsUI
      projects={projects}
      loading={loading}
      error={error}
      showForm={showForm || (!loading && !error && projects.length === 0)}
      creating={creating}
      createError={createError}
      onNewProject={() => { setCreateError(null); setShowForm(true); }}
      onCancelForm={() => setShowForm(false)}
      onCreate={handleCreate}
      onOpenProject={(projectId) => navigate(`/projects/${projectId}`)}
    />
  );
}

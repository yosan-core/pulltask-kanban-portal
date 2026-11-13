import { useState, useEffect, useRef } from "react";
import { ProjectContext, apiProjectToProjectContext } from "@domain/project";
import { searchMyProjects } from "@services/searchMyProjects";
import { useHeaders } from "@hooks/useHeaders";

interface UseProjectResult {
  project:  ProjectContext | null;
  loading:  boolean;
  error:    string | null;
  notFound: boolean;
}

// Loads one of the user's projects. If the user is not a member, it is reported as not found.
export function useProject(projectId: string | undefined): UseProjectResult {
  const [project,  setProject]  = useState<ProjectContext | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { getHeaders } = useHeaders();
  const getHeadersRef  = useRef(getHeaders);
  getHeadersRef.current = getHeaders;

  useEffect(() => {
    let cancelled = false;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const projects = await searchMyProjects(getHeadersRef.current());
        if (cancelled) return;
        const found = projects.find((p) => p.projectId === projectId);
        setProject(found ? apiProjectToProjectContext(found) : null);
        setNotFound(!found);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar el proyecto.");
          console.error("[useProject] fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProject();
    return () => { cancelled = true; };
  }, [projectId]);

  return { project, loading, error, notFound };
}

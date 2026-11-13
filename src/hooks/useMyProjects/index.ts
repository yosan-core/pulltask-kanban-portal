import { useState, useEffect, useRef, useCallback } from "react";
import type { ApiProject } from "@domain/project";
import { searchMyProjects } from "@services/searchMyProjects";
import { useHeaders } from "@hooks/useHeaders";

interface UseMyProjectsResult {
  projects: ApiProject[];
  loading:  boolean;
  error:    string | null;
  reload:   () => void;
}

export function useMyProjects(): UseMyProjectsResult {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  const { getHeaders } = useHeaders();
  const getHeadersRef  = useRef(getHeaders);
  getHeadersRef.current = getHeaders;

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await searchMyProjects(getHeadersRef.current());
        if (!cancelled) setProjects(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar los proyectos.");
          console.error("[useMyProjects] fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProjects();
    return () => { cancelled = true; };
  }, [tick]);

  return { projects, loading, error, reload };
}

import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus, apiTaskToTask } from "@domain/task";
import { searchAllTasks } from "@services/searchAllTasks";
import { updateTaskStatus } from "@services/updateTaskStatus";
import { useHeaders } from "@hooks/useHeaders";

interface UseTasksResult {
  tasks:        Task[];
  loading:      boolean;
  error:        string | null;
  updateStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  reload:       () => void;
}

export function useTasks(): UseTasksResult {
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  const { getHeaders } = useHeaders();

  const reload = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiTasks = await searchAllTasks(getHeaders());
        if (!cancelled) {
          setTasks(apiTasks.map(apiTaskToTask));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar las tareas.");
          console.error("[useTasks] fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTasks();
    return () => { cancelled = true; };
  }, [tick]);

  const updateStatus = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.taskId === taskId
            ? { ...t, status: newStatus, _raw: { ...t._raw, taskStatus: newStatus } }
            : t
        )
      );

      const task = tasks.find((t) => t.taskId === taskId);
      if (!task) return;

      try {
        await updateTaskStatus(task._raw, newStatus, getHeaders());
      } catch (err) {
        console.error("[useTasks] update error:", err);
        // Revert optimistic update on failure
        setTasks((prev) =>
          prev.map((t) =>
            t.taskId === taskId
              ? { ...t, status: task.status, _raw: task._raw }
              : t
          )
        );
      }
    },
    [tasks, getHeaders]
  );

  return { tasks, loading, error, updateStatus, reload };
}

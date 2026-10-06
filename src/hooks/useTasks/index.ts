import { useState, useEffect, useCallback } from "react";
import { ApiTask, Task, TaskStatus, apiTaskToTask } from "@domain/task";
import { searchAllTasks } from "@services/searchAllTasks";
import { updateTaskStatus } from "@services/updateTaskStatus";
import { removeTask as removeTaskService } from "@services/removeTask";
import { useHeaders } from "@hooks/useHeaders";

interface UseTasksResult {
  tasks:        Task[];
  loading:      boolean;
  error:        string | null;
  updateStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  reorderTask:  (draggingId: string, targetCardId: string | null, insertPos: "top" | "bottom" | null, targetStatus: TaskStatus) => Promise<void>;
  removeTask:   (taskId: string) => Promise<void>;
  updateTask:   (taskId: string, updates: { title?: string; description?: string; priority?: string; dueDate?: string; assigneeName?: string }) => Promise<void>;
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
    const isInitialLoad = tick === 0;

    const fetchTasks = async () => {
      if (isInitialLoad) setLoading(true);
      setError(null);
      try {
        const apiTasks = await searchAllTasks(getHeaders());
        if (!cancelled) {
          setTasks(apiTasks.map(apiTaskToTask).sort((a, b) => a.taskPosition - b.taskPosition));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar las tareas.");
          console.error("[useTasks] fetch error:", err);
        }
      } finally {
        if (!cancelled && isInitialLoad) setLoading(false);
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
            ? { ...t, status: newStatus, _raw: { ...t._raw, taskStatus: newStatus } as ApiTask }
            : t
        )
      );

      const task = tasks.find((t) => t.taskId === taskId);
      if (!task) return;

      try {
        await updateTaskStatus(task._raw!, newStatus, getHeaders());
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

  const reorderTask = useCallback(
    async (
      draggingId: string,
      targetCardId: string | null,
      insertPos: "top" | "bottom" | null,
      targetStatus: TaskStatus
    ) => {
      const dragging = tasks.find((t) => t.taskId === draggingId);
      if (!dragging) return;

      // Calculate new taskPosition from current snapshot (before state update)
      const without = tasks.filter((t) => t.taskId !== draggingId);
      let newPosition: number;

      if (!targetCardId) {
        const colTasks = without.filter((t) => t.status === targetStatus);
        newPosition = colTasks.length > 0
          ? colTasks[colTasks.length - 1].taskPosition + 1000
          : 1000;
      } else {
        const colTasks = without.filter((t) => t.status === targetStatus);
        const targetIdx = colTasks.findIndex((t) => t.taskId === targetCardId);
        if (targetIdx === -1) {
          newPosition = dragging.taskPosition;
        } else {
          const insertIdx  = insertPos === "bottom" ? targetIdx + 1 : targetIdx;
          const prevTask   = colTasks[insertIdx - 1];
          const nextTask   = colTasks[insertIdx];

          if (!prevTask) {
            newPosition = (nextTask?.taskPosition ?? 1000) - 1000;
            if (newPosition <= 0) newPosition = Math.round((nextTask?.taskPosition ?? 2000) / 2);
          } else if (!nextTask) {
            newPosition = prevTask.taskPosition + 1000;
          } else {
            newPosition = Math.round((prevTask.taskPosition + nextTask.taskPosition) / 2);
          }
        }
      }

      // Optimistic local reorder with updated position
      setTasks((prev) => {
        const withoutPrev = prev.filter((t) => t.taskId !== draggingId);
        const updated: Task = {
          ...dragging,
          status:       targetStatus,
          taskPosition: newPosition,
          _raw: dragging._raw
            ? { ...dragging._raw, taskStatus: targetStatus, taskPosition: newPosition } as ApiTask
            : undefined,
        };
        if (!targetCardId) return [...withoutPrev, updated];
        const idx = withoutPrev.findIndex((t) => t.taskId === targetCardId);
        if (idx === -1) return [...withoutPrev, updated];
        const at = insertPos === "bottom" ? idx + 1 : idx;
        const result = [...withoutPrev];
        result.splice(at, 0, updated);
        return result;
      });

      // Persist: always call API (status change OR position change)
      if (dragging._raw) {
        try {
          await updateTaskStatus(
            { ...dragging._raw, taskStatus: targetStatus, taskPosition: newPosition } as ApiTask,
            targetStatus,
            getHeaders()
          );
        } catch (err) {
          console.error("[useTasks] reorder error:", err);
          reload();
        }
      }
    },
    [tasks, getHeaders, reload]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
      try {
        await removeTaskService(taskId, getHeaders());
      } catch (err) {
        console.error("[useTasks] remove error:", err);
        reload();
      }
    },
    [getHeaders, reload]
  );

  const PRIORITY_TO_API: Record<string, string> = {
    LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical",
  };

  const updateTask = useCallback(
    async (taskId: string, updates: { title?: string; description?: string; priority?: string; dueDate?: string; assigneeName?: string }) => {
      const task = tasks.find((t) => t.taskId === taskId);
      if (!task || !task._raw) return;

      setTasks((prev) =>
        prev.map((t) =>
          t.taskId === taskId
            ? {
                ...t,
                ...(updates.title       !== undefined && { title:       updates.title }),
                ...(updates.description !== undefined && { description: updates.description }),
                ...(updates.priority    !== undefined && { priority:    updates.priority as Task["priority"] }),
                ...(updates.dueDate     !== undefined && { dueDate:     updates.dueDate }),
                ...(updates.assigneeName !== undefined && {
                  assigneeName:     updates.assigneeName || undefined,
                  assigneeInitials: updates.assigneeName ? updates.assigneeName.slice(0, 2).toUpperCase() : undefined,
                }),
              }
            : t
        )
      );

      const updatedRaw: ApiTask = {
        ...task._raw,
        taskTitle:       updates.title       ?? task._raw.taskTitle,
        taskDescription: updates.description ?? task._raw.taskDescription,
        taskPriority:    updates.priority    ? (PRIORITY_TO_API[updates.priority] ?? task._raw.taskPriority) : task._raw.taskPriority,
        dueDate:         updates.dueDate !== undefined ? (updates.dueDate || undefined) : task._raw.dueDate,
        assignedTo:      updates.assigneeName !== undefined ? (updates.assigneeName || undefined) : task._raw.assignedTo,
      };

      try {
        await updateTaskStatus(updatedRaw, task.status, getHeaders());
      } catch (err) {
        console.error("[useTasks] updateTask error:", err);
        reload();
      }
    },
    [tasks, getHeaders, reload]
  );

  return { tasks, loading, error, updateStatus, reorderTask, removeTask, updateTask, reload };
}

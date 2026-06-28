import { useState } from "react";
import { TaskStatus } from "@domain/task";
import { useTasks } from "@hooks/useTasks";
import { useBoard } from "@hooks/useBoard";
import { BoardUI } from "./interface";

export function BoardPage() {
  const { board, loading: boardLoading, error: boardError } = useBoard();
  const { tasks, loading: tasksLoading, error: tasksError, updateStatus, reload } = useTasks();

  const [draggingId,     setDraggingId]     = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn]  = useState<TaskStatus | null>(null);
  const [selectedTaskId, setSelectedTaskId]  = useState<string | null>(null);
  const [showNewTask,    setShowNewTask]     = useState(false);

  const selectedTask = tasks.find((t) => t.taskId === selectedTaskId) ?? null;
  const loading      = boardLoading || tasksLoading;
  const serviceError = boardError ?? tasksError;

  const handleDragStart      = (taskId: string)   => setDraggingId(taskId);
  const handleDragEnd        = ()                  => { setDraggingId(null); setDragOverColumn(null); };
  const handleDragOverColumn = (col: TaskStatus)   => setDragOverColumn(col);

  const handleDrop = (targetStatus: TaskStatus) => {
    if (!draggingId) return;
    updateStatus(draggingId, targetStatus);
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) =>
    updateStatus(taskId, newStatus);

  const handleCardClick    = (taskId: string) => setSelectedTaskId(taskId);
  const handleCloseDetail  = ()               => setSelectedTaskId(null);
  const handleNewTask      = ()               => setShowNewTask(true);
  const handleCloseNewTask = ()               => setShowNewTask(false);
  const handleTaskSaved    = ()               => { setShowNewTask(false); reload(); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gh-surface text-gh-muted text-sm">
        Cargando tablero…
      </div>
    );
  }

  return (
    <BoardUI
      tasks={tasks}
      board={board}
      projectName={board?.boardName ?? "PullTask"}
      serviceError={serviceError}
      draggingId={draggingId}
      dragOverColumn={dragOverColumn}
      selectedTask={selectedTask}
      showNewTask={showNewTask}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOverColumn={handleDragOverColumn}
      onDrop={handleDrop}
      onCardClick={handleCardClick}
      onCloseDetail={handleCloseDetail}
      onStatusChange={handleStatusChange}
      onNewTask={handleNewTask}
      onCloseNewTask={handleCloseNewTask}
      onTaskSaved={handleTaskSaved}
    />
  );
}

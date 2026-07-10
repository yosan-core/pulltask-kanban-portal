import { useState } from "react";
import { TaskStatus } from "@domain/task";
import { useTasks } from "@hooks/useTasks";
import { useBoard } from "@hooks/useBoard";
import { BoardUI } from "./interface";

export function BoardPage() {
  const { board, loading: boardLoading, error: boardError } = useBoard();
  const { tasks, loading: tasksLoading, error: tasksError, updateStatus, reorderTask, removeTask, updateTask, reload } = useTasks();

  const [draggingId,     setDraggingId]     = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn]  = useState<TaskStatus | null>(null);
  const [dragOverCardId, setDragOverCardId]  = useState<string | null>(null);
  const [dragPosition,   setDragPosition]   = useState<"top" | "bottom" | null>(null);
  const [selectedTaskId, setSelectedTaskId]  = useState<string | null>(null);
  const [showNewTask,    setShowNewTask]     = useState(false);

  const selectedTask = tasks.find((t) => t.taskId === selectedTaskId) ?? null;
  const loading      = boardLoading || tasksLoading;
  const serviceError = boardError ?? tasksError;

  const handleDragStart      = (taskId: string)   => setDraggingId(taskId);
  const handleDragEnd        = ()                  => { setDraggingId(null); setDragOverColumn(null); setDragOverCardId(null); setDragPosition(null); };
  const handleDragOverColumn = (col: TaskStatus)   => setDragOverColumn(col);
  const handleDragOverCard   = (cardId: string, pos: "top" | "bottom") => { setDragOverCardId(cardId); setDragPosition(pos); };

  const handleDrop = (targetStatus: TaskStatus) => {
    if (!draggingId) return;
    reorderTask(draggingId, dragOverCardId, dragPosition, targetStatus);
    setDraggingId(null);
    setDragOverColumn(null);
    setDragOverCardId(null);
    setDragPosition(null);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) =>
    updateStatus(taskId, newStatus);

  const handleRemoveTask = (taskId: string) => removeTask(taskId);
  const handleSaveTask   = (taskId: string, updates: { title?: string; description?: string; priority?: string; dueDate?: string }) =>
    updateTask(taskId, updates);

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
      onDragOverCard={handleDragOverCard}
      onDrop={handleDrop}
      dragOverCardId={dragOverCardId}
      dragPosition={dragPosition}
      onCardClick={handleCardClick}
      onRemoveTask={handleRemoveTask}
      onCloseDetail={handleCloseDetail}
      onStatusChange={handleStatusChange}
      onSaveTask={handleSaveTask}
      onNewTask={handleNewTask}
      onCloseNewTask={handleCloseNewTask}
      onTaskSaved={handleTaskSaved}
    />
  );
}

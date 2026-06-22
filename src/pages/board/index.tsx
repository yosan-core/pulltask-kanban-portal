import { useState } from "react";
import { Task, TaskStatus } from "@types/task";
import { mockTasks } from "@mocks/tasks";
import { BoardUI } from "./interface";

export function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = tasks.find((t) => t.taskId === selectedTaskId) ?? null;

  const handleDragStart = (taskId: string) => setDraggingId(taskId);

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleDragOverColumn = (columnId: TaskStatus) => setDragOverColumn(columnId);

  const handleDrop = (targetStatus: TaskStatus) => {
    if (!draggingId) return;
    setTasks((prev) =>
      prev.map((t) => (t.taskId === draggingId ? { ...t, status: targetStatus } : t))
    );
    setDraggingId(null);
    setDragOverColumn(null);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, status: newStatus } : t))
    );
    // Cuando el backend esté listo: llamar al servicio aquí
  };

  const handleCardClick = (taskId: string) => setSelectedTaskId(taskId);
  const handleCloseDetail = () => setSelectedTaskId(null);

  return (
    <BoardUI
      tasks={tasks}
      projectName="PullTask — Sprint 1"
      draggingId={draggingId}
      dragOverColumn={dragOverColumn}
      selectedTask={selectedTask}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOverColumn={handleDragOverColumn}
      onDrop={handleDrop}
      onCardClick={handleCardClick}
      onCloseDetail={handleCloseDetail}
      onStatusChange={handleStatusChange}
    />
  );
}

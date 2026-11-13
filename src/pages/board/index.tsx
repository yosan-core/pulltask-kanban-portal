import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TaskStatus } from "@domain/task";
import { useTasks } from "@hooks/useTasks";
import { useProject } from "@hooks/useProject";
import { useUsers } from "@hooks/useUsers";
import { BoardUI } from "./interface";

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, loading: projectLoading, error: projectError, notFound } = useProject(projectId);
  const { tasks: rawTasks, loading: tasksLoading, error: tasksError, updateStatus, reorderTask, removeTask, updateTask, reload } = useTasks(project?.projectId);
  const { usersByName } = useUsers();

  const [draggingId,     setDraggingId]     = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn]  = useState<TaskStatus | null>(null);
  const [dragOverCardId, setDragOverCardId]  = useState<string | null>(null);
  const [dragPosition,   setDragPosition]   = useState<"top" | "bottom" | null>(null);
  const [selectedTaskId, setSelectedTaskId]  = useState<string | null>(null);
  const [showNewTask,    setShowNewTask]     = useState(false);
  const [newTaskStatus,  setNewTaskStatus]   = useState<TaskStatus | null>(null);

  // Cruza cada tarea con la lista de usuarios para pintar la foto del asignado
  const tasks = rawTasks.map((t) => ({
    ...t,
    assigneeProfilePictureUrl: t.assigneeName ? usersByName.get(t.assigneeName)?.profilePictureUrl : undefined,
  }));

  const selectedTask = tasks.find((t) => t.taskId === selectedTaskId) ?? null;
  const loading      = projectLoading || (!!project && tasksLoading);
  const serviceError = projectError ?? tasksError;

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
  const handleSaveTask   = (taskId: string, updates: { title?: string; description?: string; priority?: string; dueDate?: string; assigneeName?: string }) =>
    updateTask(taskId, updates);

  const handleCardClick    = (taskId: string) => setSelectedTaskId(taskId);
  const handleCloseDetail  = ()               => setSelectedTaskId(null);
  const handleAddClick     = (status: TaskStatus) => { setNewTaskStatus(status); setShowNewTask(true); };
  const handleCloseNewTask = ()               => setShowNewTask(false);
  const handleTaskSaved    = ()               => { setShowNewTask(false); reload(); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gh-surface text-gh-muted text-sm">
        Cargando tablero…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 bg-gh-surface text-sm">
        <p className="text-gh-text">Este proyecto no existe o no eres miembro de él.</p>
        <Link to="/projects" className="text-brand-500 hover:text-brand-400 font-medium">
          Volver a mis proyectos
        </Link>
      </div>
    );
  }

  return (
    <BoardUI
      tasks={tasks}
      project={project}
      projectName={project?.projectName ?? "PullTask"}
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
      newTaskStatus={newTaskStatus}
      onAddClick={handleAddClick}
      onCloseNewTask={handleCloseNewTask}
      onTaskSaved={handleTaskSaved}
    />
  );
}

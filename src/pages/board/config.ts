import { TaskStatus } from "@domain/task";

export interface ColumnConfig {
  id: TaskStatus;
  label: string;
  subtitle: string;
  dotColor: string;
  accentColor: string;
  countBg: string;
}

export const COLUMNS: ColumnConfig[] = [
  {
    id: "TODO",
    label: "Por hacer",
    subtitle: "Pendiente de inicio",
    dotColor: "border-green-500",
    accentColor: "bg-green-500",
    countBg: "bg-gh-card text-gh-muted border border-gh-border",
  },
  {
    id: "IN_PROGRESS",
    label: "En progreso",
    subtitle: "Siendo trabajado activamente",
    dotColor: "border-yellow-400",
    accentColor: "bg-yellow-400",
    countBg: "bg-gh-card text-gh-muted border border-gh-border",
  },
  {
    id: "REVIEW",
    label: "En revisión",
    subtitle: "Listo para revisión",
    dotColor: "border-blue-400",
    accentColor: "bg-blue-400",
    countBg: "bg-gh-card text-gh-muted border border-gh-border",
  },
  {
    id: "DONE",
    label: "Completado",
    subtitle: "Finalizado",
    dotColor: "border-purple-500",
    accentColor: "bg-purple-500",
    countBg: "bg-gh-card text-gh-muted border border-gh-border",
  },
];

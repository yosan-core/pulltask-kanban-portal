import { TaskStatus } from "@types/task";

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
    dotColor: "bg-blue-500",
    accentColor: "bg-blue-500",
    countBg: "bg-gh-card text-gh-muted border border-gh-border",
  },
  {
    id: "IN_PROGRESS",
    label: "En progreso",
    subtitle: "Siendo trabajado activamente",
    dotColor: "bg-yellow-400",
    accentColor: "bg-yellow-400",
    countBg: "bg-gh-card text-gh-muted border border-gh-border",
  },
  {
    id: "REVIEW",
    label: "En revisión",
    subtitle: "Listo para revisión",
    dotColor: "bg-purple-400",
    accentColor: "bg-purple-400",
    countBg: "bg-gh-card text-gh-muted border border-gh-border",
  },
  {
    id: "DONE",
    label: "Completado",
    subtitle: "Finalizado",
    dotColor: "bg-green-500",
    accentColor: "bg-green-500",
    countBg: "bg-gh-card text-gh-muted border border-gh-border",
  },
];

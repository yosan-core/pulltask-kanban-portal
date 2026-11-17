export type MemberRole = "Owner" | "Admin" | "Member" | "Viewer";

// Raw shape returned by task-board-query-process-service
export interface ApiProjectMember {
  projectMemberId: string;
  projectId:       string;
  userId:          string;
  memberRole:      MemberRole;
  invitedBy?:      string;
  joinedAt?:       string;
  isActive?:       boolean;
}

// Member of the project with its public profile (name and picture) from auth
export interface ProjectMember {
  projectMemberId:    string;
  projectId:          string;
  userId:             string;
  role:               MemberRole;
  invitedBy?:         string;
  joinedAt?:          string;
  fullName:           string;
  profilePictureUrl?: string;
}

// Roles that can work on tasks (Viewer is read only)
export const ASSIGNABLE_ROLES: MemberRole[] = ["Owner", "Admin", "Member"];

export const ROLE_LABELS: Record<MemberRole, string> = {
  Owner:  "Propietario",
  Admin:  "Administrador",
  Member: "Miembro",
  Viewer: "Solo lectura",
};

// Error answered by the backend (tycause.Cause)
interface ApiCause {
  message?:     string;
  description?: string;
}

// Translates the errors of the member actions into a message for the user
export function memberErrorMessage(status: number | undefined, data: unknown, fallback: string): string {
  const description = ((data ?? {}) as ApiCause).description?.toLowerCase() ?? "";
  if (status === 404 && description.includes("email")) return "No hay una cuenta registrada con ese correo. La persona debe registrarse primero.";
  if (status === 409) return "Esa persona ya es miembro del proyecto.";
  if (description.includes("at least one owner"))  return "El proyecto debe conservar al menos un propietario.";
  if (description.includes("owner"))               return "Solo un propietario puede gestionar propietarios y administradores.";
  if (status === 403) return "No tienes permiso para hacer esto en el proyecto.";
  return fallback;
}

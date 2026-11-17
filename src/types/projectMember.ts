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
  userId:             string;
  role:               MemberRole;
  fullName:           string;
  profilePictureUrl?: string;
}

// Roles that can work on tasks (Viewer is read only)
export const ASSIGNABLE_ROLES: MemberRole[] = ["Owner", "Admin", "Member"];

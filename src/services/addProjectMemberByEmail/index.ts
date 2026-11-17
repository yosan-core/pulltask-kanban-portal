import { taskBoardCmdInstance } from "@api/taskBoardCmdInstance";
import { memberErrorMessage, type MemberRole } from "@domain/projectMember";

// Adds a registered user to the project by its email (only owners and admins).
// No retries: the errors (no account, already a member, no permission) are answers, not failures.
async function addProjectMemberByEmail(
  projectId: string,
  email: string,
  memberRole: MemberRole,
  headers: Record<string, string> = {}
): Promise<void> {
  const response = await taskBoardCmdInstance.post(
    "/project-members",
    { projectId, email: email.trim(), memberRole },
    { headers: { ...headers, "X-Action": "AddProjectMemberByEmail" } },
  );

  if (!response || response.status < 200 || response.status >= 300) {
    throw new Error(memberErrorMessage(response?.status, response?.data, "No se pudo agregar a la persona."));
  }
}

export { addProjectMemberByEmail };

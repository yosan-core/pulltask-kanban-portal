import { taskBoardCmdInstance } from "@api/taskBoardCmdInstance";
import { memberErrorMessage, type MemberRole, type ProjectMember } from "@domain/projectMember";

// Changes the role of a member. The update requires the whole membership, so the current values are sent.
async function updateProjectMemberRole(
  member: ProjectMember,
  memberRole: MemberRole,
  headers: Record<string, string> = {}
): Promise<void> {
  const response = await taskBoardCmdInstance.patch(
    "/project-members",
    {
      projectMemberId:     member.projectMemberId,
      projectId:           member.projectId,
      userId:              member.userId,
      memberRole,
      invitedBy:           member.invitedBy || member.userId,
      joinedAt:            member.joinedAt,
      isActive:            true,
      modifyJustification: "Role changed from the kanban board",
    },
    { headers: { ...headers, "X-Action": "UpdateProjectMember" } },
  );

  if (!response || response.status < 200 || response.status >= 300) {
    throw new Error(memberErrorMessage(response?.status, response?.data, "No se pudo cambiar el rol."));
  }
}

export { updateProjectMemberRole };

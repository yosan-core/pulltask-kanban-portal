import { taskBoardCmdInstance } from "@api/taskBoardCmdInstance";
import { memberErrorMessage } from "@domain/projectMember";

// Removes a member from the project (only owners and admins; owners and admins only by an owner)
async function removeProjectMember(
  projectMemberId: string,
  headers: Record<string, string> = {}
): Promise<void> {
  const response = await taskBoardCmdInstance.delete("/project-members", {
    headers: { ...headers, "X-Action": "RemoveProjectMember" },
    data:    { removeProjectMember: [{ projectMemberId, removalJustification: "Removed from the kanban board" }] },
  });

  if (!response || response.status < 200 || response.status >= 300) {
    throw new Error(memberErrorMessage(response?.status, response?.data, "No se pudo quitar a la persona."));
  }
}

export { removeProjectMember };

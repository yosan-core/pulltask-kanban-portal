import { AxiosRequestConfig } from "axios";
import { taskBoardCmdInstance } from "@api/taskBoardCmdInstance";
import type { ApiProject } from "@domain/project";

interface SaveProjectPayload {
  projectName:         string;
  projectDescription?: string;
}

// Creates a project owned by the authenticated user. The backend sets the id, slug, status,
// creator and the default columns. It is not retried: each attempt would create a new project.
async function saveProject(
  payload: SaveProjectPayload,
  headers: Record<string, string> = {}
): Promise<ApiProject> {
  const config: AxiosRequestConfig = {
    headers: { ...headers, "X-Action": "SaveProject" },
  };

  const response = await taskBoardCmdInstance.post<ApiProject>(
    "/projects",
    { projectName: payload.projectName, projectDescription: payload.projectDescription ?? "" },
    config
  );

  if (!response || response.status < 200 || response.status >= 300 || !response.data?.projectId) {
    console.error("[saveProject] failed:", response?.status, response?.data);
    throw new Error("No se pudo crear el proyecto. Inténtalo de nuevo.");
  }

  return response.data;
}

export { saveProject };

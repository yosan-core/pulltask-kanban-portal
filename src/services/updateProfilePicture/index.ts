import { AxiosRequestConfig } from "axios";
import { authInstance } from "@api/authInstance";
import type { UpdateProfilePicturePayload } from "@domain/task";

interface UpdateProfilePictureResult {
  profilePictureUrl: string;
}

async function updateProfilePicture(
  payload: UpdateProfilePicturePayload,
  headers: Record<string, string> = {}
): Promise<UpdateProfilePictureResult> {
  const formData = new FormData();
  formData.append("userAccountId", payload.userAccountId);
  formData.append("operation", payload.operation ?? "Update");

  if (payload.profilePicture) {
    formData.append("profilePicture", payload.profilePicture);
  }

  const config: AxiosRequestConfig = {
    headers: {
      ...headers,
      "X-Action": "UpdateUserProfilePicture",
      // El default del instance es "application/json"; lo quitamos para que
      // axios/el navegador generen "multipart/form-data; boundary=..." solos.
      // Un boundary fijo a mano no existe, y sin él fasthttp no puede parsear el form.
      "Content-Type": undefined,
    },
  };

  const { data, status } = await authInstance.patch<UpdateProfilePictureResult>(
    "/user-accounts/",
    formData,
    config
  );

  if (!data || status < 200 || status >= 300) {
    throw new Error("No se pudo actualizar la imagen de perfil.");
  }

  return data;
}

export { updateProfilePicture };

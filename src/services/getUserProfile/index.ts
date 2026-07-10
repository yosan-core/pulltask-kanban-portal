import { AxiosRequestConfig } from "axios";
import { authQueryInstance } from "@api/authQueryInstance";
import { apiUserProfileToUserProfile, type ApiUserProfile, type UserProfile } from "@domain/task";

async function getUserProfile(
  userAccountId: string,
  headers: Record<string, string> = {}
): Promise<UserProfile> {
  const config: AxiosRequestConfig = {
    headers: { ...headers, "X-Action": "SearchByIdUserAccount" },
  };

  const { data, status } = await authQueryInstance.get<ApiUserProfile>(
    `/user-accounts/${userAccountId}`,
    config
  );

  if (!data || status < 200 || status >= 300) {
    throw new Error("No se pudo obtener el perfil del usuario.");
  }

  return apiUserProfileToUserProfile(data);
}

export { getUserProfile };

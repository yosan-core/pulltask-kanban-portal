import { AxiosRequestConfig } from "axios";
import { maxRetriesServices } from "@config/environment";
import { authQueryInstance } from "@api/authQueryInstance";
import { apiUserProfileToUserProfile, type ApiUserProfile, type UserProfile } from "@domain/task";

// Public profile (names and picture) of the given users. Auth only answers for explicit ids.
async function searchUserProfiles(
  userAccountIds: string[],
  headers: Record<string, string> = {}
): Promise<UserProfile[]> {
  if (userAccountIds.length === 0) return [];
  const maxRetries = maxRetriesServices;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config: AxiosRequestConfig = {
        headers: { ...headers, "X-Action": "SearchAllUserAccount" },
        params:  { userAccountId: `in.${userAccountIds.join(";")}` },
      };

      const { data, status } = await authQueryInstance.get<ApiUserProfile[]>(
        "/user-accounts",
        config
      );

      if (status === 204) return [];

      if (!status || status < 200 || status >= 300 || !Array.isArray(data)) {
        throw { message: "Error al obtener los perfiles", status, data };
      }

      return data.map(apiUserProfileToUserProfile);
    } catch (error) {
      console.error(`[searchUserProfiles] attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error("No se pudieron obtener los perfiles de los miembros.");
      }
    }
  }

  return [];
}

export { searchUserProfiles };

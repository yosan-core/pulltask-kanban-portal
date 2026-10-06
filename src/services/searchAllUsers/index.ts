import { AxiosRequestConfig } from "axios";
import { maxRetriesServices } from "@config/environment";
import { authQueryInstance } from "@api/authQueryInstance";
import { apiUserProfileToUserProfile, type ApiUserProfile, type UserProfile } from "@domain/task";

async function searchAllUsers(
  headers: Record<string, string> = {}
): Promise<UserProfile[]> {
  const maxRetries = maxRetriesServices;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config: AxiosRequestConfig = {
        headers: { ...headers, "X-Action": "SearchAllUserAccount" },
        params:  { page: "1", per_page: "100" },
      };

      const { data, status } = await authQueryInstance.get<ApiUserProfile[]>(
        "/user-accounts",
        config
      );

      if (status === 204) return [];

      if (!status || status < 200 || status >= 300 || !Array.isArray(data)) {
        throw { message: "Error al obtener los usuarios", status, data };
      }

      return data.map(apiUserProfileToUserProfile);
    } catch (error) {
      console.error(`[searchAllUsers] attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw new Error("No se pudieron obtener los usuarios.");
      }
    }
  }

  return [];
}

export { searchAllUsers };

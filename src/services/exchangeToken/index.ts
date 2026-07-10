import { authInstance } from "@api/authInstance";
import type { AuthUser } from "@domain/task";

interface TokenResponse {
  accessToken:     string;
  expiresAt:       string;
  userAccountId:   string;
  userAccountRole: string;
}

async function exchangeToken(authorizationValue: string, codeVerifier: string): Promise<AuthUser> {
  const { data, status } = await authInstance.post<TokenResponse>(
    "/user-accounts/authentication-token",
    { authorizationValue, codeVerifier },
    { headers: { "X-Action": "UserAuthenticationToken" } },
  );

  if (!data || status < 200 || status >= 300) {
    throw new Error("Token exchange failed");
  }

  return {
    token:           data.accessToken,
    expiresAt:       data.expiresAt,
    userAccountId:   data.userAccountId,
    userAccountRole: data.userAccountRole,
  };
}

export { exchangeToken };

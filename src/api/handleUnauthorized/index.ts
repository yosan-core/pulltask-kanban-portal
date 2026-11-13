const TOKEN_KEY = "pulltask_token";
const USER_KEY  = "pulltask_user";

// The backend rejected the token (expired or invalid): clear the session and reload,
// so the auth context starts the login flow again.
function handleUnauthorized(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.reload();
}

export { handleUnauthorized };

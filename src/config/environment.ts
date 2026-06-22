const environment = {
  AUTH_PORTAL_URL: import.meta.env.VITE_AUTH_PORTAL_URL as string,
  TASK_API_URL:    import.meta.env.VITE_TASK_API_URL    as string,
  BUSINESS_UNIT:   import.meta.env.VITE_BUSINESS_UNIT   as string,
};

const fetchTimeoutMs = 30_000;

export { environment, fetchTimeoutMs };

const maxRetriesServices  = 3;
const fetchTimeoutServices = 30_000;

interface Environment {
  AUTH_PORTAL_URL:  string;
  TASK_API_URL:     string;
  TASK_CMD_API_URL: string;
  BUSINESS_UNIT:    string;
}

const environment: Environment = {
  AUTH_PORTAL_URL:  import.meta.env.VITE_AUTH_PORTAL_URL  as string,
  TASK_API_URL:     import.meta.env.VITE_TASK_API_URL     as string,
  TASK_CMD_API_URL: import.meta.env.VITE_TASK_CMD_API_URL as string,
  BUSINESS_UNIT:    import.meta.env.VITE_BUSINESS_UNIT    as string,
};

export { environment, maxRetriesServices, fetchTimeoutServices };

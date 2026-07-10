import axios, { AxiosInstance } from "axios";
import { environment, fetchTimeoutServices } from "@config/environment";

const authQueryInstance: AxiosInstance = axios.create({
  baseURL: environment.AUTH_QUERY_API_URL,
  timeout: fetchTimeoutServices,
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
    "X-Business-Unit": environment.AUTH_BUSINESS_UNIT,
  },
});

authQueryInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(new Error("Unknown error occurred"));
  }
);

export { authQueryInstance };

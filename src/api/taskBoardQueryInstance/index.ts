import axios, { AxiosInstance } from "axios";
import { environment, fetchTimeoutServices } from "@config/environment";

const taskBoardQueryInstance: AxiosInstance = axios.create({
  baseURL: environment.TASK_API_URL,
  timeout: fetchTimeoutServices,
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
  },
});

taskBoardQueryInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        console.error("[taskBoardQueryInstance] Request timed out");
      }
      return Promise.resolve(error.response);
    }
    return Promise.reject(new Error("Unknown error occurred"));
  }
);

export { taskBoardQueryInstance };

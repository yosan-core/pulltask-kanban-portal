import axios, { AxiosInstance } from "axios";
import { environment, fetchTimeoutServices } from "@config/environment";

const taskBoardCmdInstance: AxiosInstance = axios.create({
  baseURL: environment.TASK_CMD_API_URL,
  timeout: fetchTimeoutServices,
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
  },
});

taskBoardCmdInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        console.error("[taskBoardCmdInstance] Request timed out");
      }
      return Promise.resolve(error.response);
    }
    return Promise.reject(new Error("Unknown error occurred"));
  }
);

export { taskBoardCmdInstance };

// Union type for task status
export type TaskStatus = "open" | "in progress" | "done";

// Interface for a task including readonly field and usage of custom type
export interface Task {
  readonly id: number;
  title: string;
  description: string;
  status: TaskStatus;
}

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: string;
};

export type CreateTaskBody = {
    title: string;
    description: string;
};

export type UpdateStatusBody = {
    status: TaskStatus;
}
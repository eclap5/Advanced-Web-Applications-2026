// Union type for task status
export type TaskStatus = "open" | "in progress" | "done";

// Interface for a task including readonly field and usage of custom type
export interface Task {
  readonly id: number;
  title: string;
  description: string;
  status: TaskStatus;
}
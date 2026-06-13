export type TaskStatus = "pending" | "done";
export interface Task {
    id: number;
    title: string;
    status: TaskStatus;
}
export interface Requirement {
    id: number;
    title: string;
    tasks: Task[];
}
export interface Project {
    id: number;
    name: string;
    description: string;
    requirements: Requirement[];
}
//# sourceMappingURL=types.d.ts.map
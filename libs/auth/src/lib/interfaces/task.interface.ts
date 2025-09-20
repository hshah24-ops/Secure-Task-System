export interface Task {
  id: number;
  title: string;
  description: string;
  category?: string; // e.g. Work, Personal, Urgent
  status: string;    // e.g. Todo, InProgress, Done
  completed?: boolean
  createdAt?: string;
}
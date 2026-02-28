/**
 * Represents a single TODO item in the list.
 * id: unique identifier (used for update/delete)
 * text: the task description
 * completed: whether the task is done
 */
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

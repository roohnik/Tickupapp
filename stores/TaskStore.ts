import { makeAutoObservable } from "mobx";
import { Task } from "../types";

export class TaskStore {
  tasks: Task[] = [];
  taskToEdit: Task | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setTasks = (list: Task[]) => {
    this.tasks = list;
  };

  // 🔹 Add one
  addTask = (task: Task) => {
    const exists = this.tasks.find((t) => t.id === task.id);
    if (!exists) {
      this.tasks.push(task);
    } else {
      this.updateTask(task);
    }
  };

  // updateTask = (updated: Task) => {
  //   this.tasks = this.tasks.map((t) => (t.id === updated.id ? updated : t));
  //   if (this.taskToEdit?.id === updated.id) this.taskToEdit = updated;
  // };
  updateTask = (updated: Task) => {
    const index = this.tasks.findIndex((t) => t.id === updated.id);
    if (index >= 0) {
      // Preserve nested objects (assignee, column, etc.)
      this.tasks[index] = { ...this.tasks[index], ...updated };
    } else {
      this.tasks.push(updated);
    }

    if (this.taskToEdit?.id === updated.id) {
      this.taskToEdit = { ...this.taskToEdit, ...updated };
    }
  };

  // deleteTask = (id: string) => {
  //   this.tasks = this.tasks.filter((t) => t.id !== id);
  // };
  deleteTask = (ids: string | string[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    this.tasks = this.tasks.filter((t) => !idArray.includes(t.id));
  };

  submitTask = (data: Task) => {
    this.updateTask(data);
  };

  setTaskToEdit = (task: Task | null) => {
    this.taskToEdit = task;
  };

  // 🔹 Computed views
  get activeTasks() {
    return this.tasks.filter((t) => !t.isArchived);
  }

  get archivedTasks() {
    return this.tasks.filter((t) => t.isArchived);
  }
}

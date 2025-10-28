import { makeAutoObservable } from "mobx";
import { Process } from "../types";

export class ProcessStore {
  processes: Process[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setProcesses = (list: Process[]) => {
    this.processes = list;
  };

  addProcess = (p: Process) => {
    this.processes.push(p);
  };

  updateProcess = (updated: Process) => {
    this.processes = this.processes.map((p) =>
      p.id === updated.id ? updated : p
    );
  };

  deleteProcess = (id: string) => {
    this.processes = this.processes.filter((p) => p.id !== id);
  };
}

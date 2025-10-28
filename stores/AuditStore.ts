// Moderation History & Transparency
// Tracks actions across entities for accountability.

import { makeAutoObservable } from "mobx";
import { AuditLog } from "../types";

export class AuditStore {
  logs: AuditLog[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setLogs = (list: AuditLog[]) => {
    this.logs = list;
  };

  addLog = (log: AuditLog) => {
    this.logs.unshift(log);
  };

  getLogsForEntity = (entityId: string) =>
    this.logs.filter((log) => log.entityId === entityId);
}


// Handles strategies and indices (including archived logic).

import { makeAutoObservable } from "mobx";
import { Strategy, Index } from "../types";
import { safeEmit } from "@/utils/socketActions";

export class StrategyStore {
  strategies: Strategy[] = [];
  indices: Index[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setStrategies = (list: Strategy[]) => {
    this.strategies = list;
  };
  addStrategy = (strategy: Strategy) => {
    this.strategies.push(strategy);
  };

  // updateStrategy = (updated: Strategy) => {
  //   this.strategies = this.strategies.map((s) =>
  //     // s.id === updated.id ? updated : s
  //     s.id === updated.id ? { ...s, ...updated } : s
  //   );
  // };
  updateStrategy = (updated: Strategy) => {
    const index = this.strategies.findIndex((s) => s.id === updated.id);
    if (index >= 0) {
      this.strategies[index] = updated;
    } else {
      this.strategies.push(updated);
    }
  };

  deleteStrategy = (id: string) => {
    this.strategies = this.strategies.filter((s) => s.id !== id);
  };
  destroyStrategy = (id: string) => {
    this.strategies = this.strategies.filter((s) => s.id !== id);
  };
  restoreStrategy = (strategy: Strategy) => {
    const exists = this.strategies.find((s) => s.id === strategy.id);
    if (exists) {
      this.updateStrategy(strategy);
    } else {
      this.addStrategy(strategy);
    }
  };
  statusChangedStrategy = (strategy: Strategy) => {
    this.updateStrategy(strategy);
  };
  ownersUpdatedStrategy = (strategy: Strategy) => {
    this.updateStrategy(strategy);
  };
  swotUpdatedStrategy = (strategy: Strategy) => {
    this.updateStrategy(strategy);
  };
  unarchiveStrategy = (id: string) => {
    const strategy = this.strategies.find((s) => s.id === id);
    if (strategy) strategy.isArchived = false;
  };
  archiveStrategy = (id: string) => {
    const strategy = this.strategies.find((s) => s.id === id);
    if (strategy) strategy.isArchived = true;
  };
  unarchiveIndex = (id: string) => {
    const index = this.indices.find((i) => i.id === id);
    if (index) index.isArchived = false;
  };

  // -----------------------------
  // 🔹 Index Relations
  // -----------------------------

  setIndices = (list: Index[]) => {
    this.indices = list;
  };
  getIndicesByStrategy = (strategyId: string) => {
    return this.indices.filter((i) => i.strategyId === strategyId);
  };

  // -----------------------------
  // 🔹 Computed Getters
  // -----------------------------

  get activeStrategies() {
    return this.strategies.filter((s) => !s.isArchived);
  }

  get archivedStrategies() {
    return this.strategies.filter((s) => s.isArchived);
  }
}

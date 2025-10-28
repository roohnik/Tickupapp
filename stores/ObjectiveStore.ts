import { makeAutoObservable } from "mobx";
// import { Objective } from "../types";
import { Objective, KeyResult } from "../types";

export class ObjectiveStore {
  objectives: Objective[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Set all objectives (e.g., initial sync from server)
  setObjectives = (list: Objective[]) => {
    this.objectives = list;
  };

  // Add a new objective
  addObjective = (objective: Objective) => {
    const exists = this.objectives.some((o) => o.id === objective.id);
    if (!exists) this.objectives.push(objective);
  };

  // Update an existing objective
  updateObjective = (updated: Objective) => {
    this.objectives = this.objectives.map((o) =>
      o.id === updated.id ? updated : o
    );
  };

  // Delete an objective
  deleteObjective = (id: string) => {
    this.objectives = this.objectives.filter((o) => o.id !== id);
  };

  // Unarchive an objective
  unarchiveObjective = (id: string) => {
    this.objectives = this.objectives.map((o) =>
      o.id === id ? { ...o, isArchived: false } : o
    );
  };

  setKeyResults = (objectiveId: string, keyResults: KeyResult[]) => {
    this.objectives = this.objectives.map((o) =>
      o.id === objectiveId ? { ...o, keyResults } : o
    );
  };

  addKeyResult = (kr: KeyResult) => {
    this.objectives = this.objectives.map((o) => {
      if (o.id !== kr.objective_id) return o;
      const updatedKRs = o.keyResults ? [...o.keyResults, kr] : [kr];
      return { ...o, keyResults: updatedKRs };
    });
  };

  updateKeyResult = (kr: KeyResult) => {
    this.objectives = this.objectives.map((o) => {
      if (o.id !== kr.objective_id) return o;
      const updatedKRs = o.keyResults.map((k) => (k.id === kr.id ? kr : k));
      return { ...o, keyResults: updatedKRs };
    });
  };

  deleteKeyResult = (krId: string) => {
    this.objectives = this.objectives.map((o) => {
      if (!o.keyResults) return o;
      const updatedKRs = o.keyResults.filter((k) => k.id !== krId);
      return { ...o, keyResults: updatedKRs };
    });
  };

  unarchiveKeyResult = (objectiveId: string, keyResultId: string) => {
    this.objectives = this.objectives.map((o) => {
      if (o.id !== objectiveId) return o;
      const updatedKRs = o.keyResults.map((kr) =>
        kr.id === keyResultId ? { ...kr, isArchived: false } : kr
      );
      return { ...o, keyResults: updatedKRs };
    });
  };
  // Computed helper: filter objectives by owner
  getObjectivesByOwner = (ownerId: string) =>
    this.objectives.filter((o) => o.ownerId === ownerId);

  // Computed helper: filter objectives by strategy
  getObjectivesByStrategy = (strategyId: string) =>
    this.objectives.filter((o) => o.strategyId === strategyId);
}

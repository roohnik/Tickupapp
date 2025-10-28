import { makeAutoObservable } from "mobx";
import { Index } from "../types";
import { safeEmit } from "../utils/socketActions";

/**
 * Handles all Index (KPI / Metric) entities.
 * Each Index may belong to a Strategy and can be updated independently.
 */
export class IndexStore {
  indices: Index[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // -----------------------------
  // 🔹 CRUD (Local State)
  // -----------------------------

  setIndices = (list: Index[]) => {
    this.indices = list;
  };

  addIndex = (index: Index) => {
    this.indices.push(index);
  };

  updateIndex = (updated: Index) => {
    this.indices = this.indices.map((i) =>
      i.id === updated.id ? { ...i, ...updated } : i
    );
  };

  deleteIndex = (id: string) => {
    this.indices = this.indices.filter((i) => i.id !== id);
  };

  archiveIndex = (id: string) => {
    const index = this.indices.find((i) => i.id === id);
    if (index) index.isArchived = true;
  };

  unarchiveIndex = (id: string) => {
    const index = this.indices.find((i) => i.id === id);
    if (index) index.isArchived = false;
  };

  // -----------------------------
  // 🔹 Computed Getters
  // -----------------------------

  get activeIndices() {
    return this.indices.filter((i) => !i.isArchived);
  }

  get archivedIndices() {
    return this.indices.filter((i) => i.isArchived);
  }

  getIndicesByStrategy(strategyId: string) {
    return this.indices.filter((i) => i.strategyId === strategyId);
  }

  // -----------------------------
  // 🔹 Backend (via Socket)
  // -----------------------------

  /**
   * Fetch all indices from server.
   */
  fetchIndices = async () => {
    const res = await safeEmit("indices:list", {}, undefined, "index", "view");
    if (res.ok && res.data) {
      this.setIndices(res.data);
    }
  };

  /**
   * Create a new index (and sync with server).
   */
  createIndex = async (payload: Partial<Index>) => {
    const res = await safeEmit(
      "indices:create",
      payload,
      "Index created!",
      "index",
      "edit"
    );
    if (res.ok && res.data) {
      this.addIndex(res.data);
    }
  };

  /**
   * Update an index (and sync with server).
   */
  saveIndex = async (payload: Index) => {
    const res = await safeEmit(
      "indices:update",
      payload,
      "Index updated!",
      "index",
      "edit"
    );
    if (res.ok) {
      this.updateIndex(payload);
    }
  };

  /**
   * Delete an index (and sync with server).
   */
  removeIndex = async (id: string) => {
    const res = await safeEmit(
      "indices:delete",
      { id },
      "Index deleted!",
      "index",
      "delete"
    );
    if (res.ok) {
      this.deleteIndex(id);
    }
  };
}

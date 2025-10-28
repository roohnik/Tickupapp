import {
  emitKeyResultCreate,
  emitKeyResultDelete,
  emitKeyResultList,
  emitKeyResultUpdate,
} from "@/emitter";
import { makeAutoObservable } from "mobx";

export class KeyResultStore {
  keyResults = []; // Observable array to store KeyResults
  isLoading = false; // Observable for loading state

  constructor() {
    makeAutoObservable(this); // Automatically make properties observable
  }

  //// -------------------------------
  // ⚙️ Local State Actions
  // -------------------------------
  setKeyResults = (list) => {
    this.keyResults = list;
  };
  // Action: Add a new KeyResult
  addKeyResult = (kr) => {
    const exists = this.keyResults.some((k) => k.id === kr.id);
    if (!exists) this.keyResults.push(kr);
  };

  updateKeyResult = (updated) => {
    this.keyResults = this.keyResults.map((k) =>
      k.id === updated.id ? updated : k
    );
  };

  // Action: Delete a KeyResult
  deleteKeyResult = (id) => {
    this.keyResults = this.keyResults.filter((kr) => kr.id !== id);
  };

  // Computed: Get the total number of KeyResults
  get totalKeyResults() {
    return this.keyResults.length;
  }

  // -------------------------------
  // 🌐 Network Emitters (Optional)
  // -------------------------------
  createKeyResult = async (data) => {
    emitKeyResultCreate(data);
  };

  fetchKeyResults = async () => {
    emitKeyResultList();
  };

  saveKeyResult = async (kr) => {
    emitKeyResultUpdate(kr);
  };

  removeKeyResult = async (id) => {
    emitKeyResultDelete(id);
  };
}

// Create an instance of the store
const keyResultStore = new KeyResultStore();
export default keyResultStore;

import { makeAutoObservable } from "mobx";
import {
  emitKRCheckinCreate,
  emitKRCheckinUpdate,
  emitKRCheckinDelete,
  emitKRCheckinList,
} from "../emitter";

export class KRCheckinStore {
  checkins = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setCheckins = (list) => {
    this.checkins = list;
  };

  addCheckin = (checkin) => {
    const exists = this.checkins.some((c) => c.id === checkin.id);
    if (!exists) this.checkins.push(checkin);
  };

  updateCheckin = (updated) => {
    this.checkins = this.checkins.map((c) =>
      c.id === updated.id ? updated : c
    );
  };

  deleteCheckin = (id) => {
    this.checkins = this.checkins.filter((c) => c.id !== id);
  };

  // 🌐 Emitters for backend actions
  createCheckin = (data) => emitKRCheckinCreate(data);
  saveCheckin = (data) => emitKRCheckinUpdate(data);
  removeCheckin = (id) => emitKRCheckinDelete(id);
  fetchCheckins = () => emitKRCheckinList();
}

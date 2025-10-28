import { makeAutoObservable } from "mobx";
import { Role, User } from "../types";
import { appStore } from "./AppStore"; // careful: use only if needed


export class UserStore {
  setPreferences(value: any) {
    throw new Error("Method not implemented.");
  }
  users: User[] = [];
  currentUser: User | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUsers = (list: User[]) => {
    this.users = list;
  };

  setCurrentUser = (user: User) => {
    this.currentUser = user;
    // ✅ Attach socket listeners safely after login
    appStore.socketManager.attachListeners();
    //called only after currentUser is set
  };

  addUser = (user: User) => {
    this.users.push(user);
  };

  updateUser = (updated: User) => {
    this.users = this.users.map((u) => (u.id === updated.id ? updated : u));
    if (this.currentUser?.id === updated.id) this.currentUser = updated;
  };

  removeUser = (id: string) => {
    this.users = this.users.filter((u) => u.id !== id);
    if (this.currentUser?.id === id) this.currentUser = null;
  };

  login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await api.login(credentials); // replace with your API call
      if (res.ok) {
        this.setCurrentUser(res.user); // triggers socket attachment
      }
      return res;
    } catch (err) {
      console.error("UserStore login error:", err);
      return { ok: false, error: err };
    }
  };

  logout = () => {
    this.currentUser = null;
  };

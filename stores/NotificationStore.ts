import { makeAutoObservable } from "mobx";
import { Notification } from "../types";

export class NotificationStore {
  notifications: Notification[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setNotifications = (list: Notification[]) => {
    this.notifications = list;
  };

  addNotification = (n: Notification) => {
    this.notifications.unshift(n);
  };

  markAsRead = (id: string) => {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
  };
}

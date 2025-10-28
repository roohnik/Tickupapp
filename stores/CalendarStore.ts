// Recurrence & Scheduling
import { makeAutoObservable } from "mobx";
import { RecurrenceSettings } from "../types";
import { CalendarEvent } from "../types";

export class CalendarStore {
  events: CalendarEvent[] = [];

  recurrence: RecurrenceSettings = {
    timeRange: { start: 8, end: 20 },
  };

  constructor() {
    makeAutoObservable(this);
  }

  setRecurrence = (settings: RecurrenceSettings) => {
    this.recurrence = settings;
  };

  getTimeSlots = () => {
    const { start, end } = this.recurrence.timeRange;
    return Array.from({ length: end - start }, (_, i) => start + i);
  };
  setEvents = (list: CalendarEvent[]) => {
    this.events = list;
  };

  addEvent = (event: CalendarEvent) => {
    this.events.push(event);
  };

  updateEvent = (updated: CalendarEvent) => {
    this.events = this.events.map((e) => (e.id === updated.id ? updated : e));
  };
}

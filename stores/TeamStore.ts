import { makeAutoObservable } from "mobx";
import { Team } from "../types";

export class TeamStore {
  teams: Team[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setTeams = (list: Team[]) => {
    // this.teams = list;
    this.teams = list.slice(); // ensures MobX reactivity
    //.slice() ensures the array is cloned and tracked by MobX’s reactivity system.
  };

  addTeam = (team: Team) => {
    // this.teams.push(team);
    //Added a duplicate guard in addTeam (in case you get multiple teams:created events from sockets).
    const exists = this.teams.some((t) => t.id === team.id);
    if (!exists) this.teams.push(team);
  };

  updateTeam = (updated: Team) => {
    this.teams = this.teams.map((t) => (t.id === updated.id ? updated : t));
  };

  deleteTeam = (id: string) => {
    this.teams = this.teams.filter((t) => t.id !== id);
  };
  //Added a clearTeams helper, useful for logout or workspace reset.
  /** 🔹 Reset all teams (optional helper) */
  clearTeams = () => {
    this.teams = [];
  };
}


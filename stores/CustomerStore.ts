import { makeAutoObservable } from "mobx";
import { CustomerNeed, CustomerNeedCategory } from "../types";

export class CustomerStore {
  needs: CustomerNeed[] = [];
  categories: CustomerNeedCategory[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setNeeds = (list: CustomerNeed[]) => {
    this.needs = list;
  };

  updateNeed = (updated: CustomerNeed) => {
    this.needs = this.needs.map((n) => (n.id === updated.id ? updated : n));
  };

  deleteNeed = (id: string) => {
    this.needs = this.needs.filter((n) => n.id !== id);
  };

  addNeed = (need: CustomerNeed) => {
    this.needs.push(need);
  };

  // --------------------
  // Customer Need Categories
  // --------------------
  setCategories = (list: CustomerNeedCategory[]) => {
    this.categories = list;
  };

  addCategory = (category: CustomerNeedCategory) => {
    this.categories.push(category);
  };

  updateCategory = (updated: CustomerNeedCategory) => {
    this.categories = this.categories.map((c) =>
      c.id === updated.id ? updated : c
    );
  };

  deleteCategory = (id: string) => {
    this.categories = this.categories.filter((c) => c.id !== id);
  };
}

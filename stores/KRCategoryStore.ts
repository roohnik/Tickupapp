/*
Here’s how you can create a similar MobX store for KRCategory. 
The structure will be almost identical to the KeyResultStore, 
but the entity will be KRCategory.
*/
import { makeAutoObservable } from "mobx";
import {
  emitKRCategoryCreate,
  emitKRCategoryUpdate,
  emitKRCategoryDelete,
  emitKRCategoryList,
} from "../emitter";

export class KRCategoryStore {
  categories = []; // Observable array to store KRCategory items
  isLoading = false; // Observable for loading state

  constructor() {
    makeAutoObservable(this); // Automatically make properties observable
  }

  setCategories = (list) => {
    this.categories = list;
  };

  // Action: Add a new KRCategory
  addCategory = (cat) => {
    const exists = this.categories.some((c) => c.id === cat.id);
    if (!exists) this.categories.push(cat);
  };

  updateCategory = (updated) => {
    this.categories = this.categories.map((c) =>
      c.id === updated.id ? updated : c
    );
  };

  // Action: Delete a KRCategory
  deleteCategory = (id) => {
    this.categories = this.categories.filter((cat) => cat.id !== id);
  };

  // Computed: Get the total number of KRCategory items
  get totalCategories() {
    return this.categories.length;
  }

  // 🌐 Emitters
  createCategory = (data) => emitKRCategoryCreate(data);
  saveCategory = (data) => emitKRCategoryUpdate(data);
  removeCategory = (id) => emitKRCategoryDelete(id);
  fetchCategories = () => {
    this.isLoading = true;
    emitKRCategoryList((list) => {
      this.categories = list;
      this.isLoading = false;
    });
  };
}

// Create an instance of the store
const krCategoryStore = new KRCategoryStore();
export default krCategoryStore;

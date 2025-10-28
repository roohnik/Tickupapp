import { makeAutoObservable } from "mobx";
import { Form, FormCategory, FormSubmission } from "../types";

export class FormStore {
  forms: Form[] = [];
  formToEdit: Form | null = null;
  categories: FormCategory[] = [];
  submissions: FormSubmission[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setForms = (list: Form[]) => {
    this.forms = list;
  };

  setCategories = (list: FormCategory[]) => {
    this.categories = list;
  };

  setSubmissions = (list: FormSubmission[]) => {
    this.submissions = list;
  };

  addForm = (form: Form) => {
    this.forms.push(form);
  };

  updateForm = (updated: Form) => {
    this.forms = this.forms.map((f) => (f.id === updated.id ? updated : f));
  };

  deleteForm = (id: string) => {
    this.forms = this.forms.filter((f) => f.id !== id);
  };
  submitForm = (form: Omit<Form, "id" | "creatorId"> & { id?: string }) => {
    const newForm: Form = {
      ...form,
      id: form.id || `form-${Date.now()}`,
      creatorId: "system",
    };
    this.addForm(newForm);
  };

  addCategory = (cat: FormCategory) => {
    const exists = this.categories.some((c) => c.id === cat.id);
    if (!exists) this.categories.push(cat);
  };
  updateCategory = (updated: FormCategory) => {
    this.categories = this.categories.map((c) =>
      c.id === updated.id ? updated : c
    );
  };
  deleteCategory = (id: string) => {
    this.categories = this.categories.filter((c) => c.id !== id);
  };
}

//Then your SocketManager just calls formStore.addCategory(cat) etc.
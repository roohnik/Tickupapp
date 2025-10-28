// Handles all modal, panel, and ephemeral UI state.
//Instead of managing modal state with `useState`, you now use MobX:

import { makeAutoObservable } from "mobx";

export class UIStore {
  // To ensure that all the modal keys referenced in uiStore.isOpen exist in the modals object.
  modals: Record<string, boolean> = {
    editProfile: false,
    addTask: false,
    formBuilder: false,
    addBoard: false, // Add this key
    addProject: false,
    editTask: false,
    editProject: false,
    archivedItems: false,
    archivedProjects: false,
    createMicroLearning: false,
    createFeedback: false,
    customizeNav: false,
    googleAuth: false,
    // ...add other modals/panels here
    //   isEditProfileModalOpen = false;
    //   isAddTaskModalOpen = false;
    //   selectedTaskId: string | null = null;
    //   isFormBuilderOpen = false;
    // ...add other modal/panel states
  };

  selectedTaskId: string | null = null;
  applyTheme: any;
  constructor() {
    //ensures that changes to the modals object and confirmation object are reactive
    //This means that when a modal's state changes, the App component will re-render to reflect the updated state.
    makeAutoObservable(this);
  }

  confirmation = {
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  };

  openConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    this.confirmation = { isOpen: true, title, message, onConfirm };
  };

  closeConfirmation = () => {
    this.confirmation.isOpen = false;
  };
  openModal = (key: keyof typeof this.modals) => {
    this.modals[key] = true;
  };

  //   closeModal = (key: keyof UIStore) => {
  closeModal = (key: keyof typeof this.modals) => {
    this.modals[key] = false;
  };

  isOpen = (key: keyof typeof this.modals) => this.modals[key];

  setSelectedTaskId = (id: string | null) => {
    this.selectedTaskId = id;
  };
}

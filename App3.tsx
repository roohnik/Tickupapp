import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./stores/StoreContext";

import {Header} from "./components/Header";
import {Sidebar} from "./components/Sidebar";
import MainLayout from "./components/MainLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import SocketErrorBoundary from "./components/SocketErrorBoundary";
// import ToastContainer from "./components/ToastContainer";

// Modals
import EditProfileModal from "./modals/EditProfileModal";
import AddTaskModal from "./modals/AddTaskModal";
import AddBoardModal from "./modals/AddBoardModal";
import AddProjectModal from "./modals/AddProjectModal";
import EditTaskModal from "./modals/EditTaskModal";
import EditProjectModal from "./modals/EditProjectModal";
import ArchivedItemsModal from "./modals/ArchivedItemsModal";
import ArchivedProjectsModal from "./modals/ArchivedProjectsModal";
import ConfirmationModal from "./modals/ConfirmationModal";
import CreateMicroLearningModal from "./modals/CreateMicroLearningModal";
import CreateFeedbackModal from "./modals/CreateFeedbackModal";
import CustomizeNavModal from "./modals/CustomizeNavModal";
import GoogleAuthModal from "./modals/GoogleAuthModal";
import FormBuilderModal from "./modals/FormBuilderModal";

const App: React.FC = observer(() => {
  const { uiStore, socketManager } = useStore();

  useEffect(() => {
    socketManager.attachListeners();
  }, []);

  return (
    <ErrorBoundary>
      <SocketErrorBoundary>
        <Header />
        <Sidebar />
        <MainLayout />
        {/* <ToastContainer /> */}

        {/* Modals */}
        {/*  to check if a specific modal is open, to conditionally render the modals*/}
        {uiStore.isOpen("editProfile") && <EditProfileModal />}
        {uiStore.isOpen("addTask") && <AddTaskModal />}
        {uiStore.isOpen("addBoard") && <AddBoardModal />}
        {uiStore.isOpen("addProject") && <AddProjectModal />}
        {uiStore.isOpen("editTask") && <EditTaskModal />}
        {uiStore.isOpen("editProject") && <EditProjectModal />}
        {uiStore.isOpen("archivedItems") && <ArchivedItemsModal />}
        {uiStore.isOpen("archivedProjects") && <ArchivedProjectsModal />}
        {uiStore.confirmation.isOpen && <ConfirmationModal />}
        {uiStore.isOpen("createMicroLearning") && <CreateMicroLearningModal />}
        {uiStore.isOpen("createFeedback") && <CreateFeedbackModal />}
        {uiStore.isOpen("customizeNav") && <CustomizeNavModal />}
        {uiStore.isOpen("googleAuth") && <GoogleAuthModal />}
        {uiStore.isOpen("formBuilder") && <FormBuilderModal />}
      </SocketErrorBoundary>
    </ErrorBoundary>
  );
});

export default App;

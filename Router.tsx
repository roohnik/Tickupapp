//Let’s cleanly switch between pages using MobX:
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "./stores/StoreContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import ToastContainer from "./components/ToastContainer";

import DashboardPage from "./components/DashboardPage";
import KanbanPage from "./components/KanbanPage";
import ReportsPage from "./components/ReportsPage";
import ModerationDashboard from "./components/ModerationDashboard";
import DocumentsPage from "./components/DocumentsPage";
import LearningPage from "./components/LearningPage";
import FeedbackPage from "./components/FeedbackPage";
import TeamPage from "./components/TeamPage";
import ConsultingPage from "./components/ConsultingPage";
import PersonalDevelopmentPage from "./components/PersonalDevelopmentPage";
import CustomersPage from "./components/CustomersPage";
import SalesPage from "./components/SalesPage";
import CrmPage from "./components/CrmPage";
import ProductionPage from "./components/ProductionPage";
import QualityPage from "./components/QualityPage";
import InventoryPage from "./components/InventoryPage";
import PurchasingPage from "./components/PurchasingPage";
import MarketingPage from "./components/MarketingPage";
import RecruitmentPage from "./components/RecruitmentPage";
import ExpensesPage from "./components/ExpensesPage";
import ContractsPage from "./components/ContractsPage";
import SelfKnowledgePage from "./components/SelfKnowledgePage";
import OrganizationalKnowledgePage from "./components/OrganizationalKnowledgePage";
import UpgradePage from "./components/UpgradePage";

import { socket } from "./services/socketService";
import { safeEmit } from "./utils/socketActions";

// ...other pages

const Router: React.FC = observer(() => {
  const { 
    settingsStore, 
    documentStore, 
    userStore, 
    taskStore, 
    formStore, 
    socketManager, 
    learningStore, 
    feedbackStore, 
    teamStore 
  } = useStore();
 // Local states
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [formToDisplay, setFormToDisplay] = useState<any>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);
  const [isCreateMicroLearningOpen, setIsCreateMicroLearningOpen] = useState(false);

  switch (settingsStore.activePage) {
    case "dashboard":
      return <DashboardPage />;
    case "kanban":
      return <KanbanPage />;
    case "reports":
      return <ReportsPage />;
    case "moderation":
      return <ModerationDashboard />;
case "documents": // ✅ new case
  // Local state to trigger fetch only once
  const [documentsLoaded, setDocumentsLoaded] = useState(false);

  React.useEffect(() => {
    if (!documentsLoaded) {
      // Fetch documents
      socket.emit("documents:set", documentStore.documents);

      // Listen for updates from server
      attachListeners.socket.on("documents:updated", (updatedDoc) => {
        documentStore.updateDocument(updatedDoc);
      });

      socket.on("documents:set", (docs) => {
        documentStore.setDocuments(docs);
      });

      // Fetch document statuses from server
      socket.emit("documentStatuses:list", null, (statuses) => {
        documentStore.setStatuses(statuses);
      });

      setDocumentsLoaded(true);

      // Cleanup listeners when unmounting
      return () => {
        socket.off("documents:updated");
        socket.off("documents:set");
      };
    }
  }, [documentsLoaded, socketManager, documentStore]);
      return (
        <DocumentsPage
          documents={documentStore.documents}
          setDocuments={documentStore.setDocuments}
          users={userStore.users}
          tasks={taskStore.tasks}
          forms={formStore.forms}
          documentStatuses={documentStore.statuses}
          onSelectTask={setSelectedTaskId}
          onOpenForm={(id) =>
            setFormToDisplay(formStore.forms.find((f) => f.id === id) || null)
          }
          activeDocumentId={activeDocumentId}
          setActiveDocumentId={setActiveDocumentId}
        />
      );

      case "learning":
      return (
        <>
          <ToastContainer position="bottom-left" autoClose={3000} />
          <LearningPage
            assignments={learningStore.assignments}
            resources={{ microLearnings: [], youtubeVideos: [], books: [] }} // update as needed
            users={userStore.users}
            currentUser={userStore.currentUser}
            objectives={learningStore.objectives}
            onUpdateStatus={(id, status) =>
              socket.emit("learningAssignments:update", { id, status })
            }
            onCreateMicroLearning={() => setIsCreateMicroLearningOpen(true)}
            onViewMicroLearning={setFormToDisplay}
          />
        </>
      );
 
    case "feedback":
      return (
        <>
          <ToastContainer position="bottom-left" autoClose={3000} />
          <FeedbackPage
            objectives={learningStore.objectives}
            users={userStore.users}
            feedbackTags={feedbackStore.tags}
            onSaveFeedbackTag={(tag) => console.log(tag)} // implement handler
            onDeleteFeedbackTag={(tagId) => console.log(tagId)} // implement handler
            learningAssignments={learningStore.assignments}
            resources={{ microLearnings: [], youtubeVideos: [], books: [] }}
            onUpdateLearningAssignmentStatus={(id, status) =>
              socket.emit("learningAssignments:update", { id, status })
            }
          />
        </>
      );

    case "team":
      return (
        <>
          <ToastContainer position="bottom-left" autoClose={3000} />
          <TeamPage
            users={userStore.users}
            teams={teamStore.teams}
            objectives={learningStore.objectives}
            tasks={taskStore.tasks}
            submissions={[]}
            forms={formStore.forms}
            feedbackTags={feedbackStore.tags}
            onSaveTeam={(teamData) =>
              safeEmit(
                teamData.id ? "teams:update" : "teams:create",
                teamData,
                teamData.id ? "teams updated" : "teams created"
              )
            }
            onDeleteTeam={(teamId: any) => safeEmit("teams:delete", teamId, "teams deleted")}
          />
        </>
      );

    case "consulting":
      return (
        <>
          {selectedConsultant && (
            <ConsultingPage
              consultant={selectedConsultant}
              onBack={() => {
                settingsStore.activePage = "dashboard";
                setSelectedConsultant(null);
              }}
            />
          )}
        </>
      );

    case "personalDevelopment":
      return <PersonalDevelopmentPage />;
    case "customers":
      return <CustomersPage />;
    case "sales":
      return <SalesPage />;
    case "crm":
      return <CrmPage />;
    case "production":
      return <ProductionPage />;
    case "quality":
      return <QualityPage />;
    case "inventory":
      return <InventoryPage />;
    case "purchasing":
      return <PurchasingPage />;
    case "marketing":
      return <MarketingPage />;
    case "recruitment":
      return <RecruitmentPage />;
    case "expenses":
      return <ExpensesPage />;
    case "contracts":
      return <ContractsPage />;
    case "selfKnowledge":
      return <SelfKnowledgePage />;
    case "organizationalKnowledge":
      return <OrganizationalKnowledgePage />;
    case "upgrade":
      return <UpgradePage />;

    case "projects":
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <h1 className="text-2xl font-semibold">صفحه پروژه‌ها - به زودی...</h1>
        </div>
      );


    // ...other cases
    default:
      return <DashboardPage />;
  }
});

export default Router;

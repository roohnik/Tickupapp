import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores/StoreContext";
import Router from "../Router";

const MainLayout: React.FC = observer(() => {
  const { settingsStore } = useStore();

  return (
    <main className={`layout ${settingsStore.theme}`}>
      <Router />
    </main>
  );
});

export default MainLayout;
//Wraps the routed page in layout styling.

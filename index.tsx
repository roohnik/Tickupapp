import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App3.tsx";
import { StoreProvider } from "./stores/StoreContext";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);

//MobX store is provided to the app. Your repo already had StoreContext — this makes it active.



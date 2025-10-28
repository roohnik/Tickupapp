import React, { createContext, useContext } from "react";
import { appStore, AppStoreType } from "./AppStore";

const StoreContext = createContext<AppStoreType>(appStore);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StoreContext.Provider value={appStore}>{children}</StoreContext.Provider>
);

export const useStore = () => useContext(StoreContext);


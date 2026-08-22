import { createContext, useContext } from "react";
import { useBioSecureData } from "../api/useBioSecureData";

const DataContext = createContext(null);

export function DataProvider({ role, user = null, children }) {
  const data = useBioSecureData(role, user);
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

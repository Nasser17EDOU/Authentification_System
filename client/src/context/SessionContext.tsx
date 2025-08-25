import { createContext, useContext, useState, type ReactNode } from "react";
import type { ApiResponse } from "../utilities/interfaces/auth.interface";
import type { Permission } from "../utilities/interfaces/types.interface";
import {
  containsAllPermissions,
  containsPermission,
  containsSomePermissions,
} from "../utilities/linksAndPermissions.utilities";

const SESSION_KEY = import.meta.env.VITE_SESSION_KEY;

const SessionContext = createContext<
  | {
      sessionData: Omit<ApiResponse<null>, "data" | "message">;
      updateSessionData: (
        newSessionData: Omit<ApiResponse<null>, "data" | "message">
      ) => void;
      sessionUserHasPermission: (permission: Permission) => boolean;
      sessionUserHasAllPermissions: (
        permissionsToCheck: Permission[]
      ) => boolean;
      sessionUserHasSomePermissions: (
        permissionsToCheck: Permission[]
      ) => boolean;
    }
  | undefined
>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessionData, setSessionData] = useState<
    Omit<ApiResponse<null>, "data" | "message">
  >(() => {
    // Retrieve user from sessionStorage when the app loads
    const storedSessionData = sessionStorage.getItem(SESSION_KEY);
    return storedSessionData
      ? JSON.parse(storedSessionData)
      : { authStatus: "Logged out" };
  });

  const updateSessionData = (
    newSessionData: Omit<ApiResponse<null>, "data" | "message">
  ) => {
    const { authStatus, currentUser } = newSessionData;
    setSessionData({ authStatus, currentUser });
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ authStatus, currentUser })
    );
  };

  const sessionUserHasPermission = (permission: Permission) =>
    containsPermission(permission, sessionData.currentUser?.permissions ?? []);

  const sessionUserHasAllPermissions = (permissionsToCheck: Permission[]) =>
    containsAllPermissions(
      permissionsToCheck,
      sessionData.currentUser?.permissions ?? []
    );

  const sessionUserHasSomePermissions = (permissionsToCheck: Permission[]) =>
    containsSomePermissions(
      permissionsToCheck,
      sessionData.currentUser?.permissions ?? []
    );

  return (
    <SessionContext.Provider
      value={{
        sessionData,
        updateSessionData,
        sessionUserHasPermission,
        sessionUserHasAllPermissions,
        sessionUserHasSomePermissions,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const sessionDataContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("sessionData must be used within a UserSessionProvider");
  }
  return context;
};

import type { Permission } from "./types.interface";
import type { User } from "./user.interface";

export interface ApiResponse<T> {
  authStatus:
    | "Logged out"
    | "Logged in"
    | "Account delete"
    | "Account inactive"
    | "Initialized password"
    | "Expired password";
  currentUser?: {
    nom: User["nom"];
    prenom: User["prenom"];
    genre: User["genre"];
    permissions: Permission[];
  };
  data?: T;
  message?: string;
}

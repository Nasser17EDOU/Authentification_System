import type { Permission } from "./types.interface";
import type { User } from "./user.interface";

export interface LoginCredential {
  login: string;
  pass: string;
}

export interface UpdateUserPassCredential {
  oldPass: string;
  newPass: string;
}

export interface ApiResponse<T> {
  isUserLogged?: boolean;
  isUserDelete?: boolean;
  isUserActive?: boolean;
  isUserPassInitial?: boolean;
  isUserPassExpired?: boolean;
  success: boolean;
  currentUser?: {
    nom: User["nom"];
    prenom: User["prenom"];
    genre: User["genre"];
  };
  permissions?: Permission[];
  data?: T;
  message?: string;
}

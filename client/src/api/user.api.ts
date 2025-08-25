import type { ApiResponse } from "../utilities/interfaces/auth.interface";
import type { Logging } from "../utilities/interfaces/logging.interface";
import type { Profil } from "../utilities/interfaces/profil.interface";
import type {
  NewUser,
  User,
  UserToUpdate,
} from "../utilities/interfaces/user.interface";
import { BaseApi, getEndpoint } from "./base.api";

const baseEndpoint = "user";
export const userApi = (
  updateSessionData: (
    newSessionData: Omit<ApiResponse<null>, "data" | "message">
  ) => void
) => ({
  getUserSessionApi: () =>
    BaseApi({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["session"]),
    }),

  authUserApi: (data: { login: string; pass: string }) =>
    BaseApi<boolean, typeof data>({
      updateSessionData,
      method: "POST",
      endpoint: getEndpoint(baseEndpoint, ["auth"]),
      data,
    }),

  logoutUserApi: () =>
    BaseApi({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["logout"]),
    }),

  getUsersApi: () =>
    BaseApi<User[]>({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["users"]),
    }),

  getUsersWithProfilesApi: () =>
    BaseApi<(User & { profiles: Profil[] })[]>({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["usersWithProfiles"]),
    }),

  getUserByIdApi: (user_id: number) =>
    BaseApi<User | null>({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["user", user_id]),
    }),

  createUserApi: (data: { userData: NewUser; pass: string }) =>
    BaseApi<boolean, typeof data>({
      updateSessionData,
      method: "POST",
      endpoint: getEndpoint(baseEndpoint, ["user"]),
      needsConfirmation: true,
      showInformation: true,
      data,
    }),

  updateUserApi: (data: UserToUpdate) =>
    BaseApi<boolean, UserToUpdate>({
      updateSessionData,
      method: "PUT",
      endpoint: getEndpoint(baseEndpoint, ["user"]),
      needsConfirmation: true,
      showInformation: true,
      data,
    }),

  changeUserStatusApi: (data: { user_id: number; is_active: boolean }) =>
    BaseApi<boolean, typeof data>({
      updateSessionData,
      method: "PUT",
      endpoint: getEndpoint(baseEndpoint, ["changeUserStatus"]),
      needsConfirmation: true,
      showInformation: true,
      data,
    }),

  deleteUserApi: (user_id: number) =>
    BaseApi<boolean>({
      updateSessionData,
      method: "DELETE",
      endpoint: getEndpoint(baseEndpoint, ["user", user_id]),
      needsConfirmation: true,
      showInformation: true,
    }),

  searchUserLoggingsApi: (data: {
    dateDebut: Date | null;
    dateFin: Date | null;
    searchValue: string | null;
  }) =>
    BaseApi<
      (Logging & {
        login: User["login"];
        nom: User["nom"];
        prenom: User["prenom"];
      })[],
      typeof data
    >({
      updateSessionData,
      method: "POST",
      endpoint: getEndpoint(baseEndpoint, ["userLoggings"]),
      data,
    }),
});

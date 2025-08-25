import type { Permission } from "../utilities/interfaces/types.interface";
import type { Profil } from "../utilities/interfaces/profil.interface";
import { BaseApi, getEndpoint } from "./base.api";
import type { ApiResponse } from "../utilities/interfaces/auth.interface";

const baseEndpoint = "profile";

export const profileApi = (
  updateSessionData: (
    newSessionData: Omit<ApiResponse<null>, "data" | "message">
  ) => void
) => ({
  getProfilesApi: () =>
    BaseApi<Profil[]>({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["profiles"]),
    }),

  getProfilesWithPermissionsApi: () =>
    BaseApi<(Profil & { permissions: Permission[] })[]>({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["profilesWithPermissions"]),
    }),

  getProfileByIdApi: (profil_id: number) =>
    BaseApi<Profil | null>({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["profile", profil_id]),
    }),

  getAProfilePermissionsApi: (profil_id: number) =>
    BaseApi<Permission[]>({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["profilePermissions", profil_id]),
    }),

  getAUserProfilesApi: (user_id: number) =>
    BaseApi<Profil[]>({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["userProfiles", user_id]),
    }),

  createProfileApi: (profil_lib: string) =>
    BaseApi<boolean, { profil_lib: string }>({
      updateSessionData,
      method: "POST",
      endpoint: getEndpoint(baseEndpoint, ["profile"]),
      needsConfirmation: true,
      showInformation: true,
      data: { profil_lib },
    }),

  updateProfileApi: (data: { profil_id: number; profil_lib: string }) =>
    BaseApi<boolean, typeof data>({
      updateSessionData,
      method: "PUT",
      endpoint: getEndpoint(baseEndpoint, ["profile"]),
      needsConfirmation: true,
      showInformation: true,
      data,
    }),

  deleteProfileApi: (profil_id: number) =>
    BaseApi<boolean>({
      updateSessionData,
      method: "DELETE",
      endpoint: getEndpoint(baseEndpoint, ["profile", profil_id]),
      needsConfirmation: true,
      showInformation: true,
    }),

  updateProfilePermissionsApi: (data: {
    profil_id: number;
    permissions: Permission[];
  }) =>
    BaseApi<boolean, typeof data>({
      updateSessionData,
      method: "PUT",
      endpoint: getEndpoint(baseEndpoint, ["profilePermissions"]),
      needsConfirmation: true,
      showInformation: true,
      data,
    }),

  updateUserProfilesApi: (data: { user_id: number; profil_ids: number[] }) =>
    BaseApi<boolean, typeof data>({
      updateSessionData,
      method: "PUT",
      endpoint: getEndpoint(baseEndpoint, ["userProfiles"]),
      needsConfirmation: true,
      showInformation: true,
      data,
    }),
});

import type { ApiResponse } from "../utilities/interfaces/auth.interface";
import type { PassParam } from "../utilities/interfaces/passParam.interface";
import { BaseApi, getEndpoint } from "./base.api";

const baseEndpoint = "password";

export const passwordApi = (
  updateSessionData: (
    newSessionData: Omit<ApiResponse<null>, "data" | "message">
  ) => void
) => ({
  getPassParamApi: () =>
    BaseApi<PassParam | null>({
      updateSessionData,
      method: "GET",
      endpoint: getEndpoint(baseEndpoint, ["passParam"]),
    }),

  updatePassParamApi: (data: {
    pass_expir_day: number;
    allow_past_pass: boolean;
  }) =>
    BaseApi<boolean, typeof data>({
      updateSessionData,
      method: "PUT",
      endpoint: getEndpoint(baseEndpoint, ["passParam"]),
      needsConfirmation: true,
      showInformation: true,
      data,
    }),

  initUserPassApi: (data: { user_id: number; pass: string }) =>
    BaseApi<boolean, typeof data>({
      updateSessionData,
      method: "POST",
      endpoint: getEndpoint(baseEndpoint, ["userPass"]),
      needsConfirmation: true,
      showInformation: true,
      data,
    }),

  updateUserPassApi: (data: {
    oldPass: string;
    pass: string;
    isUpdate: boolean;
  }) =>
    BaseApi<boolean, typeof data>({
      updateSessionData,
      method: "PUT",
      endpoint: getEndpoint(baseEndpoint, ["userPass"]),
      needsConfirmation: true,
      showInformation: true,
      data,
    }),
});

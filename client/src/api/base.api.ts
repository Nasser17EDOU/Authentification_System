import axios, { type AxiosResponse, type AxiosError } from "axios";
import { confirmDialog } from "../components/confirmDialog";
import type { ApiResponse } from "../utilities/interfaces/auth.interface";
import { infoDialog } from "../components/infoDialog";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const BaseApi = async <T = any, U = any>({
  updateSessionData,
  method,
  endpoint,
  showInformation = false,
  needsConfirmation = false,
  confirmMessage = "Êtes-vous sûr de poursuivre?",
  data,
  params,
}: {
  updateSessionData: (
    newSessionData: Omit<ApiResponse<null>, "data" | "message">
  ) => void;
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  showInformation?: boolean;
  needsConfirmation?: boolean;
  confirmMessage?: string;
  data?: U;
  params?: U;
}): Promise<T | undefined> => {
  try {
    // Confirmation si nécessaire
    if (needsConfirmation) {
      const confirmed = await confirmDialog({
        title: "Confirmation",
        message: confirmMessage,
        severity: "warning",
      });

      if (!confirmed) {
        return undefined;
      }
    }

    // Requête API
    const response: AxiosResponse<ApiResponse<T>> = await apiClient({
      method,
      url: endpoint,
      data,
      params,
    });

    const isSuccess = response.status >= 200 && response.status < 300;

    // Message d’info si besoin
    if (showInformation || !isSuccess) {
      const message =
        response.data.message || getDefaultMessage(response.status);
      await infoDialog({
        title: "Information",
        message,
        severity: isSuccess ? "success" : "warning",
      });
    }

    // Mise à jour de la session
    const { authStatus, currentUser } = response.data;
    updateSessionData({ authStatus, currentUser });
    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<T>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      // axiosError.message ||
      "Une erreur est survenue. Veuillez réessayer plus tard.";

    await infoDialog({
      title: "Information",
      message: errorMessage,
      severity: "warning",
    });

    if (axiosError.response?.data) {
      // Mise à jour de la session
      const { authStatus, currentUser } = axiosError.response.data;
      updateSessionData({ authStatus, currentUser });
    }

    return undefined;
  }

  function getDefaultMessage(status: number): string {
    const messages: Record<number, string> = {
      400: "Mauvaise requête. Contactez l'administrateur.",
      401: "Non-autorisé.",
      404: "Élément introuvable.",
      409: "Problème de conflit.",
      500: "Erreur interne du serveur.",
    };

    return (
      messages[status] ||
      "Une erreur est survenue. Veuillez réessayer plus tard."
    );
  }
};

export const getEndpoint = (
  baseEndpoint: string,
  params: (string | number)[] = []
) => {
  const cleanBase = baseEndpoint.replace(/^\/|\/$/g, "");
  const validParams = params
    .filter((param) => param !== null && param !== undefined && param !== "")
    .map((param) => param.toString().trim())
    .filter((param) => param.length > 0)
    .map((param) => encodeURIComponent(param.replace(/\//g, "")));

  if (validParams.length === 0) {
    return `/${cleanBase}`;
  }

  return `/${cleanBase}/${validParams.join("/")}`;
};

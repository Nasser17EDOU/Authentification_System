import { Response, NextFunction } from "express";
import { ApiResponse, AuthRequest } from "../utils/interfaces/auth.interface";
import logger from "../utils/logger.utils";
import { userServices } from "../api/user/userServices";
import { destroySession } from "./sessionMiddleware";
import passwordServices from "../api/password/passwordServices";
import profileServices from "../api/profile/profileServices";

export const requestMiddlewares = {
  // Basic middleware for requests that don't require session checks
  requestMiddleware: async (
    req: AuthRequest & { apiResponse?: ApiResponse<any> },
    res: Response,
    next: NextFunction
  ) => {
    req.apiResponse = { authStatus: "Logged out" };

    try {
      next();
    } catch (error) {
      logger.error("An error occurred during a request:", error);
      res.status(500).send(req.apiResponse);
    }
  },

  // Middleware with full session verification and permission loading
  requestMiddlewareWithSessionCheck: async <T>(
    req: AuthRequest & { apiResponse?: ApiResponse<T> },
    res: Response,
    next: NextFunction
  ) => {
    const response: ApiResponse<T> = {
      authStatus: req.session.user_id ? "Logged in" : "Logged out",
    };

    try {
      // Early return if not logged in
      if (response.authStatus === "Logged out") {
        return res.status(401).json({
          ...response,
          message: "Vous devez vous connecter.",
        });
      }

      const userId = req.session.user_id!;
      const [userStatus, user, isInitialPass, isPassExpired] =
        await Promise.all([
          userServices.getUserActiveAndDeleteStatusServ(userId),
          userServices.getUserByIdServ(userId),
          passwordServices.isInitialPasswordServ(userId),
          passwordServices.isPasswordExpiredServ(userId),
        ]);

      // Validate user status
      if (!userStatus || !user) {
        throw new Error("Failed to fetch user data");
      }

      if (userStatus.is_delete) {
        await Promise.all([
          userServices.recordUserLogoutServ(userId),
          destroySession(req.session, res),
        ]);
        return res.status(401).json({
          authStatus: "Account delete",
          message: "Votre compte a été supprimé",
        });
      }

      if (!userStatus.is_active) {
        return res.status(401).json({
          authStatus: "Account inactive",
          messag:
            "Votre compte est désactivé. Veuillez contacter votre Administrateur.",
        });
      }

      // Password checks
      if (isInitialPass) {
        return res.status(401).json({
          authStatus: "Initialized password",
          message:
            "Votre mot de passe a été réinitialisé. Vous devez le mettre à jour.",
        });
      }

      if (isPassExpired) {
        return res.status(401).json({
          authStatus: "Expired password",
          message: "Votre mot de passe a expiré. Vous devez le mettre à jour.",
        });
      }

      // Load permissions
      const permissions =
        await profileServices.getDistinctPermissionsForUserServ(userId);

      req.apiResponse = {
        ...response,
        currentUser: {
          nom: user.nom,
          prenom: user.prenom,
          genre: user.genre,
          permissions,
        },
      };

      next();
    } catch (error) {
      logger.error("Request processing error:", error);
      res.status(500).json({
        authStatus: "error",
        message: "Une erreur interne est survenue",
      });
    }
  },
};

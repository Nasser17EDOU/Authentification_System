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
    const response: ApiResponse<any> = {
      authStatus: req.session.user_id ? "Logged in" : "Logged out",
    };

    // Add activity tracking after response is sent
    res.on("finish", () => {
      if (req.session?.user_id) {
        void userServices
          .recordUserLatestActivTimeServ(req.session.user_id)
          .catch((error) => {
            logger.error("Failed to record user activity:", error);
          });
      }
    });

    try {
      if (response.authStatus === "Logged out") {
        response.message = "Vous devez vous connecter.";
      } else {
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

        if (userStatus.is_delete || !userStatus.is_active) {
          await userServices.recordUserLatestActivTimeServ(userId, false);
          await Promise.all([destroySession(req.session, res)]);
          return res.status(401).send({
            authStatus: userStatus.is_delete
              ? "Account delete"
              : "Account inactive",
            message: userStatus.is_delete
              ? "Votre compte a été supprimé"
              : "Votre compte est désactivé. Veuillez contacter votre Administrateur.",
          });
        }

        response.currentUser = {
          nom: user.nom,
          prenom: user.prenom,
          genre: user.genre,
          permissions: [],
        };

        // Password checks
        if (isInitialPass || isPassExpired) {
          response.authStatus = isInitialPass
            ? "Initialized password"
            : "Expired password";
          response.message = isInitialPass
            ? "Votre mot de passe a été réinitialisé. Vous devez le mettre à jour."
            : "Votre mot de passe a expiré. Vous devez le mettre à jour.";
        }

        // Load permissions
        response.currentUser.permissions =
          await profileServices.getDistinctPermissionsForUserServ(userId);
      }
      req.apiResponse = { ...response };
      next();
    } catch (error) {
      logger.error("An error occurred during a request:", error);
      if (!res.headersSent) {
        res.status(500).send(req.apiResponse);
      }
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

    // Add activity tracking after response is sent
    res.on("finish", () => {
      if (req.session?.user_id) {
        void userServices
          .recordUserLatestActivTimeServ(req.session.user_id)
          .catch((error) => {
            logger.error("Failed to record user activity:", error);
          });
      }
    });

    try {
      // Early return if not logged in
      if (response.authStatus === "Logged out") {
        return res.status(401).send({
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

      if (userStatus.is_delete || !userStatus.is_active) {
        await userServices.recordUserLatestActivTimeServ(userId, false);
        await Promise.all([destroySession(req.session, res)]);
        return res.status(401).send({
          authStatus: userStatus.is_delete
            ? "Account delete"
            : "Account inactive",
          message: userStatus.is_delete
            ? "Votre compte a été supprimé"
            : "Votre compte est désactivé. Veuillez contacter votre Administrateur.",
        });
      }

      response.currentUser = {
        nom: user.nom,
        prenom: user.prenom,
        genre: user.genre,
        permissions: [],
      };

      // Password checks
      if (isInitialPass || isPassExpired) {
        return res.status(401).send({
          ...response,
          authStatus: isInitialPass
            ? "Initialized password"
            : "Expired password",
          message: isInitialPass
            ? "Votre mot de passe a été réinitialisé. Vous devez le mettre à jour."
            : "Votre mot de passe a expiré. Vous devez le mettre à jour.",
        });
      }

      // Load permissions
      response.currentUser.permissions =
        await profileServices.getDistinctPermissionsForUserServ(userId);
      req.apiResponse = { ...response };
      next();
    } catch (error) {
      logger.error("An error occurred during a request:", error);
      if (!res.headersSent) {
        res.status(500).send(req.apiResponse);
      }
    }
  },
};

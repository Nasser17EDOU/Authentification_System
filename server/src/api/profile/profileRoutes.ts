// profileRoutes.ts
import express, { Router } from "express";
import { requestMiddlewares } from "../../middlewares/requestMiddlewares";
import profileControllers from "./profileControllers";

const profileRouter: Router = express.Router();

// profile routes
profileRouter.get(
  "/profiles",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  profileControllers.getProfilesControl
);

profileRouter.get(
  "/profilesWithPermissions",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  profileControllers.getProfilesWithPermissionsControl
);

profileRouter.get(
  "/profile/:profil_id",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  profileControllers.getProfileByIdControl
);

profileRouter.get(
  "/profilePermissions/:profil_id",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  profileControllers.getAProfilePermissionsControl
);

profileRouter.get(
  "/userProfiles/:user_id",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  profileControllers.getAUserProfilesControl
);

profileRouter.post(
  "/profile",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  profileControllers.createProfileControl
);

profileRouter.put(
  "/profile",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  profileControllers.updateProfileControl
);

profileRouter.delete(
  "/profile/:profil_id",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  profileControllers.deleteProfileControl
);

profileRouter.put(
  "/profilePermissions",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  profileControllers.updateProfilePermissionsControl
);

profileRouter.put(
  "/userProfiles",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  profileControllers.updateUserProfilesControl
);

export default profileRouter;

// userRoutes.ts
import express, { Router } from "express";
import { requestMiddlewares } from "../../middlewares/requestMiddlewares";
import userControllers from "./userControllers";

const userRouter: Router = express.Router();

// User routes
userRouter.get(
  "/session",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  userControllers.getUserSessionControl
);

userRouter.get(
  "/auth",
  requestMiddlewares.requestMiddleware,
  userControllers.authUserControl
);

userRouter.get(
  "/logout",
  requestMiddlewares.requestMiddleware,
  userControllers.logoutUserControl
);

userRouter.get(
  "/users",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  userControllers.getUsersControl
);

userRouter.get(
  "/usersWithProfiles",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  userControllers.getUsersWithProfilesControl
);

userRouter.get(
  "/user/:user_id",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  userControllers.getUserByIdControl
);

userRouter.post(
  "/user",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  userControllers.createUserControl
);

userRouter.put(
  "/user",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  userControllers.updateUserControl
);

userRouter.delete(
  "/user/:user_id",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  userControllers.deleteUserControl
);

userRouter.get(
  "/userLoggings",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  userControllers.searchUserLoggingsControl
);

export default userRouter;

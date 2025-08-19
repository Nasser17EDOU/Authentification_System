// passwordRoutes.ts
import express, { Router } from "express";
import { requestMiddlewares } from "../../middlewares/requestMiddlewares";
import passwordControllers from "./passwordControllers";

const passwordRouter: Router = express.Router();

// password routes
passwordRouter.get(
  "/passParam",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  passwordControllers.getPassParamControl
);

passwordRouter.put(
  "/passParam",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  passwordControllers.updatePassParamControl
);

passwordRouter.post(
  "/userPass",
  requestMiddlewares.requestMiddlewareWithSessionCheck,
  passwordControllers.initUserPassControl
);

passwordRouter.put(
  "/userPass",
  requestMiddlewares.requestMiddleware,
  passwordControllers.updateUserPassControl
);

export default passwordRouter;

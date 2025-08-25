import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import {
  ApiResponse,
  AuthRequest,
} from "../../utils/interfaces/auth.interface";
import { PassParam } from "../../utils/interfaces/passParam.interface";
import passwordServices from "./passwordServices";
import bcrypt from "bcryptjs";

const passwordControllers = {
  getPassParamControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<PassParam | null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const passParam = await passwordServices.getPassParamServ();

      if (!passParam) {
        response.message = "Aucun profil trouvé";
      }
      response.data = passParam;

      res.status(passParam ? 200 : 404).send(response);
      return;
    }
  ),

  updatePassParamControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<boolean>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const { pass_expir_day, allow_past_pass } = req.body as {
        pass_expir_day: number;
        allow_past_pass: boolean;
      };

      await passwordServices.updatePassParamServ(
        pass_expir_day,
        allow_past_pass,
        req.session.user_id!
      );

      response.message = "Configuration mise à jour avec succès.";
      response.data = true;

      res.status(200).send(response); // OK
      return;
    }
  ),

  initUserPassControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<boolean>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const user_id = req.body.user_id as number;
      const pass = await bcrypt.hash((req.body.pass as string).trim(), 10);

      await passwordServices.createUserPasswordServ(
        user_id,
        pass,
        true,
        req.session.user_id!
      );

      response.message = "Mot de passe réinitialisé avec succès.";
      response.data = true;

      res.status(200).send(response); // OK
      return;
    }
  ),

  updateUserPassControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<boolean>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const oldPass = (req.body.oldPass as string).trim();
      let pass = (req.body.pass as string).trim();
      const isUpdate = req.body.pass as boolean;
      // const pass = await bcrypt.hash(req.body.pass as string, 10);
      const user_id = req.session.user_id!;

      if (
        !(await bcrypt.compare(
          oldPass,
          (await passwordServices.getCurrentUserPasswordServ(user_id))!.pass
        ))
      ) {
        response.message = "Mot de passe incorrect";
        response.data = false;
        res.status(401).send(response);
        return;
      }

      const allow_past_pass =
        (await passwordServices.getPassParamServ())?.allow_past_pass ?? false;

      if (
        !allow_past_pass &&
        (await passwordServices.passwordInHistoryServ(user_id, pass))
      ) {
        response.message = "Mot de passe déjà utilisé";
        response.data = false;
        res.status(401).send(response);
        return;
      }

      pass = await bcrypt.hash(pass, 10);

      if (isUpdate) {
        await passwordServices.updateCurrentPasswordServ(user_id, pass);
      } else {
        await passwordServices.createUserPasswordServ(
          user_id,
          pass,
          false,
          req.session.user_id!
        );
      }

      response.message = "Mot de passe mis à jour avec succès.";
      response.data = true;
      response.authStatus = "Logged in";

      res.status(200).send(response); // OK
      return;
    }
  ),
};

export default passwordControllers;

import { Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import {
  ApiResponse,
  AuthRequest,
} from "../../utils/interfaces/auth.interface";
import { Profil } from "../../utils/interfaces/profil.interface";
import { Permission } from "../../utils/interfaces/types.interface";
import profileServices from "./profileServices";

const profileControllers = {
  getProfilesControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<Profil[]>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      response.data = await profileServices.getAllProfilesServ();

      res.status(200).send(response); // OK
      return;
    }
  ),

  getProfilesWithPermissionsControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<(Profil & { permissions: Permission[] })[]>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const profils = await profileServices.getAllProfilesServ();
      const allProfilePerms =
        await profileServices.getAllProfilePermissionsServ();

      response.data = profils.map((p) => ({
        ...p,
        permissions: allProfilePerms
          .filter((pm) => pm.profil_id === p.profil_id)
          .map((pm) => pm.permission),
      }));

      res.status(200).send(response); // OK
      return;
    }
  ),

  getProfileByIdControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<Profil | null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;
      const profil_id = parseInt(req.params.profil_id);

      const profil = await profileServices.getProfileByIdServ(profil_id);

      if (!profil) {
        response.message = "Profil introuvable";
      }
      response.data = profil;

      res.status(profil ? 200 : 404).send(response);
      return;
    }
  ),

  getAProfilePermissionsControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<Permission[]>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;
      const profil_id = parseInt(req.params.profil_id);

      response.data = await profileServices.getAProfilePermissionsServ(
        profil_id
      );

      res.status(200).send(response);
      return;
    }
  ),

  getAUserProfilesControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<Profil[]>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;
      const user_id = parseInt(req.params.user_id);

      response.data = await profileServices.getAUserProfilesServ(user_id);

      res.status(200).send(response);
      return;
    }
  ),

  createProfileControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const profil_lib = (req.body as string).trim().toUpperCase();

      const similProfile = await profileServices.getProfileByLibServ(
        profil_lib
      );

      if (similProfile?.is_delete) {
        await profileServices.updateProfileServ(
          similProfile.profil_id,
          profil_lib,
          req.session.user_id!
        );
      } else if (!similProfile) {
        await profileServices.createProfileServ(
          profil_lib,
          req.session.user_id!
        );
      }

      response.message = !similProfile
        ? "Profil créé avec succès"
        : similProfile.is_delete
        ? "Profil restauré avec succès"
        : "Ce profil existe déjà";

      res
        .status(!similProfile || similProfile.is_delete ? 200 : 409)
        .send(response);
      return;
    }
  ),

  updateProfileControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;
      const profil_id = req.body.profil_id as number;
      const profil_lib = (req.body.profil_lib as string).trim().toUpperCase();

      const exist = await profileServices.profileExistsServ(
        profil_lib,
        profil_id
      );

      if (!exist) {
        await profileServices.updateProfileServ(
          profil_id,
          profil_lib,
          req.session.user_id!
        );
      }

      response.message = exist
        ? "Ce profil existe déjà"
        : "Profil mis à jour avec succès";

      res.status(exist ? 409 : 200).send(response); // OK
      return;
    }
  ),

  deleteProfileControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;
      const profil_id = parseInt(req.params.profil_id);

      await profileServices.softDeleteProfileServ(
        profil_id,
        req.session.user_id!
      );

      response.message = "Profil supprimé avec succès";

      res.status(200).send(response); // OK
      return;
    }
  ),

  updateProfilePermissionsControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const profil_id = req.body.profil_id as number;
      const permissions = req.body.permissions as Permission[];

      await profileServices.updateProfilePermissionsServ(
        permissions,
        profil_id,
        req.session.user_id!
      );

      response.message = "Mise à jour des permission éffectuée avec succès.";

      res.status(200).send(response); // OK
      return;
    }
  ),

  updateUserProfilesControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const user_id = req.body.user_id as number;
      const profil_ids = req.body.profil_ids as number[];

      await profileServices.updateUserProfilesServ(
        user_id,
        profil_ids,
        req.session.user_id!
      );

      response.message = "Mise à jour des profils éffectuée avec succès.";

      res.status(200).send(response); // OK
      return;
    }
  ),
};

export default profileControllers;

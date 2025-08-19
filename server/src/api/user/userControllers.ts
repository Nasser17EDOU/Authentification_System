import bcrypt from "bcryptjs";
import { catchAsync } from "../../utils/catchAsync";
import {
  ApiResponse,
  AuthRequest,
} from "../../utils/interfaces/auth.interface";
import { Response } from "express";
import { userServices } from "./userServices";
import passwordServices from "../password/passwordServices";
import { destroySession } from "../../middlewares/sessionMiddleware";
import {
  NewUser,
  User,
  UserToUpdate,
} from "../../utils/interfaces/user.interface";
import { Profil } from "../../utils/interfaces/profil.interface";
import profileServices from "../profile/profileServices";
import { Logging } from "../../utils/interfaces/logging.interface";

const userControllers = {
  getUserSessionControl: catchAsync(
    async (
      req: AuthRequest & { apiResponse?: ApiResponse<null> },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;
      res.status(200).send(response); // OK
      return;
    }
  ),

  authUserControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<boolean>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;
      const login = (req.body.login as string).trim().toUpperCase();
      const pass = (req.body.login as string).trim();

      const user = await userServices.getUserByLoginServ(login);
      if (!user) {
        response.data = false;
        response.message = "Login ou mot de passe incorrect";
        res.status(401).send(response);
        return;
      }

      const userPass = await passwordServices.getCurrentUserPasswordServ(
        user.user_id
      );
      if (!userPass || !(await bcrypt.compare(pass, userPass.pass))) {
        response.data = false;
        response.message = "Login ou mot de passe incorrect";
        res.status(401).send(response);
        return;
      }

      await userServices.recordUserLoggingServ(user.user_id);

      req.session.user_id = user.user_id;
      response.data = true;
      res.status(200).send(response); // OK
      return;
    }
  ),

  logoutUserControl: catchAsync(
    async (
      req: AuthRequest & { apiResponse?: ApiResponse<null> },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      if (!req.session.user_id) {
        response.message = "Vous êtes déjà déconnecté.";
        response.authStatus = "Logged out";
        res.status(200).send(response); // OK
        return;
      }

      const user_id = req.session.user_id;

      if (!(await destroySession(req.session, res))) {
        response.message =
          "Nous avons eu du mal à vous déconnecter. Veuillez réessayer plutard. Si cela persiste contactez l'administrateur.";
        res.status(500).send(response); // Internal Server Error
        return;
      }
      await userServices.recordUserLogoutServ(user_id);
      response.message = "Vous avez été déconnecté(e) avec succès.";
      response.authStatus = "Logged out";
      res.status(200).send(response); // OK
      return;
    }
  ),

  getUsersControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<User[]>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      response.data = await userServices.getAllUsersServ();

      res.status(200).send(response); // OK
      return;
    }
  ),

  getUsersWithProfilesControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<(User & { profiles: Profil[] })[]>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const users = await userServices.getAllUsersServ();
      const profiles = await profileServices.getAllProfilesServ();
      const usersProfiles = await profileServices.getAllUserProfilesServ();

      response.data = users.map((u) => ({
        ...u,
        profiles: profiles.filter((p) =>
          usersProfiles.some(
            (up) => up.profil_id === p.profil_id && up.user_id === u.user_id
          )
        ),
      }));

      res.status(200).send(response); // OK
      return;
    }
  ),

  getUserByIdControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<User | null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;
      const user_id = parseInt(req.params.user_id);

      const user = await userServices.getUserByIdServ(user_id);

      if (!user) {
        response.message = "Utilisateur introuvable";
      }
      response.data = user;

      res.status(user ? 200 : 404).send(response);
      return;
    }
  ),

  createUserControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const userData: Omit<NewUser, "createur_id"> = req.body.userData;

      userData.login = userData.login.trim().toUpperCase();
      userData.nom = userData.nom.trim();
      userData.prenom = userData.prenom?.trim() || null;
      userData.email = userData.email?.trim() || null;
      userData.tel = userData.tel?.trim() || null;

      const pass = (req.body.pass as string).trim();

      const similUser = await userServices.getUserByLoginServ(userData.login);
      let user_id = -1;
      if (similUser?.is_delete) {
        await userServices.reactivateDeletedUserServ(
          similUser.user_id,
          req.session.user_id!
        );
        user_id = similUser.user_id;
      } else if (!similUser) {
        user_id = await userServices.createUserServ({
          ...userData,
          createur_id: req.session.user_id!,
        });
      }

      if (user_id !== -1) {
        await passwordServices.createUserPasswordServ(
          user_id,
          await bcrypt.hash(pass, 10),
          true,
          req.session.user_id!
        );
      }

      response.message = !similUser
        ? "Utilisateur créé avec succès"
        : similUser.is_delete
        ? "Utilisateur restauré avec succès"
        : "Cet utilisateur existe déjà";

      res.status(!similUser || similUser.is_delete ? 200 : 409).send(response);
      return;
      return;
    }
  ),

  updateUserControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;

      const userData: Omit<UserToUpdate, "modifieur_id"> = req.body;

      userData.login = userData.login.trim().toUpperCase();
      userData.nom = userData.nom.trim();
      userData.prenom = userData.prenom?.trim() || null;
      userData.email = userData.email?.trim() || null;
      userData.tel = userData.tel?.trim() || null;

      const exist = await userServices.loginExistsServ(
        userData.login,
        userData.user_id
      );

      if (!exist) {
        await userServices.updateUserServ({
          ...userData,
          modifieur_id: req.session.user_id!,
        });
      }

      response.message = exist
        ? "Cet utilisateur existe déjà"
        : "Utilisateur mis à jour avec succès";

      res.status(exist ? 409 : 200).send(response); // OK
      return;
    }
  ),

  deleteUserControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<null>;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;
      const user_id = parseInt(req.params.user_id);

      await userServices.softDeleteUserServ(user_id, req.session.user_id!);

      response.message = "Utilisateur supprimé avec succès";

      res.status(200).send(response); // OK
      return;
    }
  ),

  searchUserLoggingsControl: catchAsync(
    async (
      req: AuthRequest & {
        apiResponse?: ApiResponse<
          (Logging & {
            login: User["login"];
            nom: User["nom"];
            prenom: User["prenom"];
          })[]
        >;
      },
      res: Response
    ): Promise<void> => {
      const response = req.apiResponse!;
      const filterData: {
        dateDebut?: Date;
        dateFin?: Date;
        searchValue?: string | null;
      } = req.body;

      response.data = await userServices.searchUserLoggingsServ(filterData);

      res.status(200).send(response); // OK
      return;
    }
  ),
};

export default userControllers;

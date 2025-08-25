import {
  AdminPanelSettings,
  Login,
  ManageAccounts,
  Password,
  Menu,
} from "@mui/icons-material";
import type { Permission } from "./interfaces/types.interface";
import { configData } from "./configData.utilities";
import ProfilsPage from "../pages/profiles/ProfilsPage";
import UserLoggings from "../pages/user_loggings/UserLoggings";
import PassParam from "../pages/pass_param/PassParam";
import Users from "../pages/users/Users";

const adminMenuObject = {
  label: "Admin",
  icon: <AdminPanelSettings />,
  linkObjList: [
    {
      link: "/administration/gestionutilisateurs",
      component: <Users />,
      linkLabel: "Gestion Des Utilisateurs",
      permission: "Consulter les utilisateurs" as Permission | null,
      linkIcon: <ManageAccounts />,
    },
    {
      link: "/administration/configurationmotdepasse",
      component: <PassParam />,
      linkLabel: "Paramètres Des Mots de Passe",
      permission:
        "Consulter les paramètres des mots de passe" as Permission | null,
      linkIcon: <Password />,
    },
    {
      link: "/administration/connexionutilisateurs",
      component: <UserLoggings />,
      linkLabel: "Connexions Des Utilisateurs",
      permission:
        "Consulter les connexions des utilisateurs" as Permission | null,
      linkIcon: <Login />,
    },
    {
      link: "/administration/gestionprofils",
      component: <ProfilsPage />,
      linkLabel: "Gestion Des Profils",
      permission: "Consulter les profils" as Permission | null,
      linkIcon: <Menu />,
    },
  ],
};

export const getAllMenuObjects = [adminMenuObject];

export const getMenuObjectListByPermissions = (permissions: Permission[]) =>
  getAllMenuObjects
    .filter((menu) =>
      menu.linkObjList.some(
        (linkObj) =>
          linkObj.permission === null ||
          permissions.some((permission) => permission === linkObj.permission)
      )
    )
    .map((menu) => ({
      ...menu,
      linkObjList: menu.linkObjList.filter(
        (sm) =>
          sm.permission === null ||
          permissions.some((perm) => perm === sm.permission)
      ),
    }));

export const containsPermission = (
  permissionToCheck: Permission,
  permissionList: Permission[]
) => permissionList.some((permission) => permission === permissionToCheck);

export const containsAllPermissions = (
  permissionsToCheck: Permission[],
  permissionList: Permission[]
) => permissionsToCheck.every((pc) => permissionList.some((pl) => pl === pc));

export const containsSomePermissions = (
  permissionsToCheck: Permission[],
  permissionList: Permission[]
) => permissionsToCheck.some((pc) => permissionList.some((pl) => pl === pc));

export const getAllPossiblePermissions = (): Permission[] => {
  return (
    Object.keys(configData.permissionGroups) as Array<
      keyof typeof configData.permissionGroups
    >
  ).flatMap((key) => configData.permissionGroups[key]);
};

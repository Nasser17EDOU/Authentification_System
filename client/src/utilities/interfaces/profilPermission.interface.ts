import type { Permission } from "./types.interface";

export interface ProfilPermission {
  profil_permission_id: number;
  profil_id: number;
  permission: Permission;
}

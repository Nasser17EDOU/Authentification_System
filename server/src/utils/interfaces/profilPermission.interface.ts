import type { Permission } from "./types.interface";

export interface ProfilPermission {
  profil_permission_id: number;
  profil_id: number;
  permission: Permission;
}

// ======================
// New / Update DTO Types
// ======================

export type NewProfilPermission = Omit<
  ProfilPermission,
  "profil_permission_id"
>;
export type ProfilPermissionToUpdate = Omit<ProfilPermission, never>;

export type SqlTableType =
  | "users"
  | "pass_params"
  | "user_pass"
  | "loggings"
  | "profils"
  | "profil_permissions"
  | "user_profils";

export type Genre = "Masculin" | "Féminin";

export type Permission =
  // permissions utilisateurs
  | "Consulter les utilisateurs"
  | "Créer les utilisateurs"
  | "Modifier les utilisateurs"
  | "Supprimer les utilisateurs"
  | "Modifier les profils des utilisateurs"

  // permissions paramètres des mots de passe
  | "Consulter les paramètres des mots de passe"
  | "Modifier les paramètres des mots de passe"

  // permissions connexions des utilisateurs
  | "Consulter les connexions des utilisateurs"

  // permissions profils
  | "Consulter les profils"
  | "Créer les profils"
  | "Modifier les profils"
  | "Supprimer les profils"
  | "Modifier les permissions des profils"

  // permissions Departement
  | "Consulter les directions & départements"
  | "Créer les directions & départements"
  | "Modifier les directions & départements"
  | "Supprimer les directions & départements"

  // permissions employes
  | "Consulter les employés"
  | "Créer les employés"
  | "Modifier les employés"
  | "Supprimer les employés"

  // permissions missions
  | "Consulter les missions"
  | "Créer les missions"
  | "Modifier les missions"
  | "Supprimer les missions"
  | "Approuver les missions"
  | "Verrouiller & déverrouiller les missions";

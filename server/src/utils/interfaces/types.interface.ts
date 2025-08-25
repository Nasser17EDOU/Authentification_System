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
  | "Modifier les permissions des profils";

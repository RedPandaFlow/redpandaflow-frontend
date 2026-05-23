import { z } from "zod";

const required = (message = "Champ requis.") =>
  z.string().trim().min(1, message);

const emailField = required("L'adresse email est requise.").email(
  "Adresse email invalide.",
);

const passwordField = z
  .string()
  .min(12, "12 caractères minimum.")
  .max(128, "128 caractères maximum.");

export const loginSchema = z.object({
  email: emailField,
  password: required("Mot de passe requis."),
});

export const registerSchema = z
  .object({
    username: required("Le nom d'utilisateur est requis.")
      .min(3, "3 caractères minimum.")
      .max(25, "25 caractères maximum."),
    email: emailField,
    password: passwordField,
    confirmPassword: required("Confirmez votre mot de passe."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });

export const createWorkspaceSchema = z.object({
  name: required("Le nom est requis.")
    .min(2, "2 caractères minimum.")
    .max(25, "25 caractères maximum."),
  description: z
    .string()
    .trim()
    .max(500, "500 caractères maximum.")
    .optional()
    .or(z.literal("")),
});

export const createBoardSchema = z.object({
  title: required("Le titre est requis.")
    .min(2, "2 caractères minimum.")
    .max(25, "25 caractères maximum."),
  workspaceId: required("Sélectionnez un espace de travail."),
});

export const inviteMemberSchema = z.object({
  email: emailField,
  role: z.enum(["Admin", "Member", "Viewer"], { error: "Rôle invalide." }),
});

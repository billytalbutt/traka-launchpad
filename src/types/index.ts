export type LaunchType = "WEB" | "DESKTOP" | "PROTOCOL";
export type AnnouncementType = "INFO" | "WARNING" | "UPDATE" | "NEW";
export type UserRole = "ADMIN" | "APP_SUPPORT" | "EU_TECH_SUPPORT" | "UK_TECH_SUPPORT";

export const ALL_ROLES: UserRole[] = [
  "ADMIN",
  "APP_SUPPORT",
  "EU_TECH_SUPPORT",
  "UK_TECH_SUPPORT",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  APP_SUPPORT: "App Support",
  EU_TECH_SUPPORT: "EU Tech Support",
  UK_TECH_SUPPORT: "UK Tech Support",
};

export interface ToolWithFavorite {
  id: string;
  name: string;
  description: string;
  iconName: string;
  launchUrl: string | null;
  launchType: string;
  category: string;
  version: string | null;
  isActive: boolean;
  sortOrder: number;
  color: string | null;
  allowedRoles: string | null;
  isFavorite: boolean;
  launchCount: number;
}

export type LaunchType = "WEB" | "DESKTOP" | "PROTOCOL";
export type AnnouncementType = "INFO" | "WARNING" | "UPDATE" | "NEW";
export type UserRole = "USER" | "ADMIN";

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
  isFavorite: boolean;
  launchCount: number;
}

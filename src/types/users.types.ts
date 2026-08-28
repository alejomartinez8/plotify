export type UserRole = "admin" | "treasurer";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  createdAt: string;
}

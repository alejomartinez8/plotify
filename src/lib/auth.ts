import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { logger } from "@/lib/logger";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-change-in-production";
const TOKEN_EXPIRY = "7d";

export interface JWTPayload {
  role: "admin";
  iat: number;
  exp: number;
}

export function generateToken(): string {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    logger.error("Token verification failed", error instanceof Error ? error : new Error(String(error)), {
      component: 'auth'
    });
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;
    
    if (!token) {
      return false;
    }

    const payload = verifyToken(token);
    return payload !== null && payload.role === "admin";
  } catch (error) {
    logger.error("Error checking authentication", error instanceof Error ? error : new Error(String(error)), {
      component: 'auth'
    });
    return false;
  }
}

export async function requireAuth(): Promise<boolean> {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    throw new Error("Authentication required");
  }
  return true;
}
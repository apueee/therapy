import { auth } from "./config";
import type { SessionUser } from "./types";
import type { UserType } from "@/lib/types/enums";

export async function getSession() {
  return auth();
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(...allowedTypes: UserType[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowedTypes.includes(user.userType)) {
    throw new Error("Forbidden");
  }
  return user;
}

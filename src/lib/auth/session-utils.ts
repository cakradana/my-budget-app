import { Session } from "next-auth";

export interface AuthSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function isAuthenticatedSession(
  session: Session | null
): session is AuthSession {
  return !!(session?.user as AuthSession["user"])?.id;
}

// Type assertion helper for session
export function getAuthenticatedSession(
  session: Session | null
): AuthSession | null {
  if (isAuthenticatedSession(session)) {
    return session;
  }
  return null;
}

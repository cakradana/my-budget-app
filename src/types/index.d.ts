// Consolidated type definitions

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
  }
}

// Global type overrides
declare global {
  namespace NextAuth {
    interface Session {
      user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };
    }

    interface User {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export {};

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

import 'express';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  username?: string;
  role?: string;
  // add any other fields your app uses
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser; // properly typed across controllers
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  username?: string;
  role?: string;
  // add other fields your app uses
}

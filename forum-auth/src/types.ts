import type { User } from './db.js';

export type AppVariables = {
  csrfToken: string;
  user: User;
};

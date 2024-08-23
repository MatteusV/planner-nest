import { Request } from 'express';

export interface RequestAuth extends Request {
  user: {
    iat: number;
    email: string;
    id: string;
  };
}

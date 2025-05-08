export interface JwtPayload {
    sub: string;
    username: string;
    role: string[];
    company_id?: (number | null)[];
    exp?: number;
  }
  
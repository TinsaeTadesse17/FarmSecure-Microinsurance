import { Role } from "./constants/roles.enum";

export interface JwtPayload {
    sub: string;
    username: string;
    role: Role[];
    company_id?: (number | null)[];
    exp?: number;
}
  
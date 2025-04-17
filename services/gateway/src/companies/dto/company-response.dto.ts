// src/company-management/dto/company-response.dto.ts
export class CompanyResponseDto {
    id: number;
    name: string;
    licenseNo: string;
    licensedBy: string;
    operationDate: string; // ISO date string
    capital: number;
    country: string;
    city: string;
    phoneNo: string;
    postalCode: string;
    email: string;
    status: 'pending' | 'approved' | 'subscribed';
    createdAt: string; // ISO datetime string
  }
  
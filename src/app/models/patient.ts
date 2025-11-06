export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Address {
  id?: number;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface Patient {
  id?: number;
  pid: string;
  firstName: string;
  lastName: string;
  /** ISO date string: yyyy-MM-dd */
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  address: Address;
}

export interface PageResp<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;   // page size
}
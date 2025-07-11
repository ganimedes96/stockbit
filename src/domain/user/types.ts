export interface Company {
  id: string;
  name: string;
  email?: string;
  slug?: string;
  phone?: string;
  address: string;
  cnpj?: string;
}

export interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword?: string | undefined;
}

export interface Limit {
  products: number;
  services: number;
  dashboard: string;
  employees: number;
  reports: number;
  pdv: boolean;
}

export interface Subscription {
  id?: string;
  isSubscribed: boolean;
  status: "active" | "canceled" | "unpaid";
  nextCharge: number;
  start: Date;
  price: number;
  cycle: string;
  plan: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "employee";
  company: Company;
  isTrial: boolean;
  imagePath?: string;
  limit: Limit;
  subscription: Subscription;
  emailVerified: boolean;
  customerId?: string;
  createdAt: Date;
  active: boolean;
}

export interface CreateUser extends Customer {
  role: "admin" | "employee";
  company: {
    name: string;
    slug?: string;
    email?: string;
    address: string;
    cnpj?: string;
  };
}

export interface ProfileProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photo?: File;
  company: {
    name: string;
    address: string;
    cnpj?: string;
  };
}

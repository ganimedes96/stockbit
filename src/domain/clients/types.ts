/* eslint-disable @typescript-eslint/no-empty-object-type */

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthday?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type Address = {
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state?: string;
  complement?: string;
};

export interface CreateClient {
  name: string;
  email?: string;
  birthday?: string;
  phone?: string;
  isFieldAddressed?: boolean;
  address?: Address;
}

export interface UpdateClient extends Omit<CreateClient, "createdAt"> {}

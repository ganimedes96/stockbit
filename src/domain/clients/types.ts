/* eslint-disable @typescript-eslint/no-empty-object-type */


export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
}

export interface CreateClient {
  name: string;
  email?: string;
  phone?: string;
}


export interface UpdateClient extends Omit<CreateClient, "createdAt"> {}

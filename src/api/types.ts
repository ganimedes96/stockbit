export interface ResponseServerAction<T = undefined> {
  status: StatusServer;
  message: string;
  data?: T;
}

export enum StatusServer {
  success = "success",
  error = "error",
  empty = "empty",
}

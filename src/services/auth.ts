export interface HydraCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

export interface ICredentials {
  email: string;
  password: string;
}

export interface IToken {
  token: string;
  exp: number;
}

export interface DecodedToken extends IToken {
  id: number;
  email: string;
  roles: string[];
  name: string;
  surname: string;
}

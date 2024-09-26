export interface HydraCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

export interface ICredentials {
  email: string;
  password: string;
}

export interface ITokenResponse {
  token: string;
  refresh_token: string;
  exp: number;
}

export interface IDecodedToken {
  id: number;
  email: string;
  roles: string[];
  name: string;
  surname: string;
  exp: number;
  iat: number;
}

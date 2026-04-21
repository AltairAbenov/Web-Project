export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}
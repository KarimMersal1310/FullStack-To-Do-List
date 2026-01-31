import type { LoginDTO, RegisterDTO, UpdateDTO, UserToReturnDTO } from './apiTypes';
import { httpRequest } from './http';

export async function login(dto: LoginDTO): Promise<UserToReturnDTO> {
  return httpRequest<UserToReturnDTO>('/api/Authentication/Login', {
    method: 'POST',
    body: dto,
  });
}

export async function register(dto: RegisterDTO): Promise<UserToReturnDTO> {
  return httpRequest<UserToReturnDTO>('/api/Authentication/Register', {
    method: 'POST',
    body: dto,
  });
}

export async function updateUser(dto: UpdateDTO, token: string): Promise<boolean> {
  return httpRequest<boolean>('/api/Authentication', {
    method: 'PUT',
    body: dto,
    token,
  });
}


import type { AuthSession, User } from '../../domain/entities/User'

type UserDto = {
  id: number
  username: string
  fullName: string
}

export type LoginResponseDto = {
  tokenType: string
  accessToken: string
  expiresInSeconds: number
  user: UserDto
}

export const AuthMapper = {
  toUser(dto: UserDto): User {
    return {
      id: dto.id,
      username: dto.username,
      fullName: dto.fullName,
    }
  },
  toSession(dto: LoginResponseDto): AuthSession {
    return {
      tokenType: dto.tokenType,
      accessToken: dto.accessToken,
      expiresInSeconds: dto.expiresInSeconds,
      user: AuthMapper.toUser(dto.user),
    }
  },
}

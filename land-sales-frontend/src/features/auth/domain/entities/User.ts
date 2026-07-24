export type User = {
  id: number
  username: string
  fullName: string
}

export type AuthSession = {
  tokenType: string
  accessToken: string
  expiresInSeconds: number
  user: User
}

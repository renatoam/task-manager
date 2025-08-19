export interface SignUpBody {
  email: string
  name?: string
  password: string
  confirmPassword: string
}

export interface SignInBody {
  email: string
  password: string
}

export interface ResetPasswordBody {
  token: string
  password: string
  confirmPassword: string
}

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
}

export interface RefreshToken {
  id: number
  token: string
  userId: string
  expiresAt: Date
  createdAt: Date
  revokedAt: Date | null
  userAgent: string | null
  ipAddress: string | null
}

export interface PasswordResetToken {
  id: number
  token: string
  userId: string
  expiresAt: Date
  createdAt: Date
  usedAt: Date | null
}

export interface CreateRefreshTokenData {
  expiresAt: Date
  token: string
  createdAt: Date
  ipAddress: string
  userAgent: string
}

export interface ConfigRefreshTokenData {
  tokenName: string
  httpOnly: boolean
  secure: boolean
  sameSite: 'strict' | 'lax' | 'none'
  path: string
  maxAge: number
}

export type GenerateRefreshTokenResponse = {
  createData: CreateRefreshTokenData
  configData: ConfigRefreshTokenData
}

export interface DeviceInfo {
  ipAddress: string
  userAgent: string
}

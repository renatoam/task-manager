import argon from "argon2"
import { SignJWT } from "jose"
import { randomBytes } from "node:crypto"
import * as constants from "../../shared/constants"
import { ServerError, UnauthorizedError } from "../../shared/errors"
import type {
  ConfigRefreshTokenData,
  CreateRefreshTokenData,
  DeviceInfo,
  GenerateRefreshTokenResponse,
  User,
} from "./auth.types"
import type { NextRequest } from "next/server"

export const generateAccessToken = async (userId: string) => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const accessToken = await new SignJWT({ userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15 min')
      .setIssuedAt()
      .setSubject(userId)
      .sign(secret)
  
    return {
      accessToken,
      expiresIn: constants.AVG_AGE
    }
  } catch (error) {
    throw new ServerError(error as Error)
  }
}

export const generateRefreshToken = (
  request: NextRequest
): GenerateRefreshTokenResponse => {
  const { ipAddress, userAgent } = getDeviceInfo(request)
  const refreshTokenOpaque = randomBytes(48).toString('hex')
  const expiresAt = new Date(Date.now() + constants.MAX_AGE)

  const createData: CreateRefreshTokenData = {
    expiresAt,
    token: refreshTokenOpaque,
    createdAt: new Date(Date.now()),
    ipAddress,
    userAgent,
  }

  const configData: ConfigRefreshTokenData = {
    tokenName: constants.REFRESH_TOKEN_COOKIE_NAME,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: constants.REFRESH_TOKEN_COOKIE_PATH,
    maxAge: constants.MAX_AGE
  }

  return {
    createData,
    configData
  }
}

export const validatePassword = async (password: string, user: User) => {
  const { passwordHash, ...userData } = user
  try {
    const isPasswordValid = await argon.verify(passwordHash, password)

    if (!isPasswordValid) {
      throw new UnauthorizedError(
        Error(constants.INVALID_PASSWORD_MESSAGE)
      )
    }

    return userData
  } catch (error) {
    throw new UnauthorizedError(error as Error)
  }
}

export const getDeviceInfo = (request: NextRequest): DeviceInfo => {
  const ipAddress = request.headers.get('x-forwarded-for') ?? ''
  const userAgent = request.headers.get('user-agent') ?? ''
  return {
    ipAddress,
    userAgent
  }
}

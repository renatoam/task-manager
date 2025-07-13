import argon from "argon2";
import type { GetUserResponseDto, SignedUserResponseDto } from "./auth.dto";
import { generateAccessToken, generateRefreshToken, getDeviceInfo, validatePassword } from "./auth.helpers";
import { AuthService } from "./auth.service";
import { NextRequest } from "next/server";
import { errorResponseHandler } from "../http/httpErrorResponseHandler";
import { successResponseHandler } from "../http/httpSuccessResponseHandler";
import { HTTP_STATUS_CODE } from "../http/httpResponseHandlers";
import { cookies } from "next/headers";
import * as constants from "../../shared/constants";
import type { RefreshToken, User } from "./auth.types";
import { UnauthorizedError } from "../../shared/errors";

export class AuthController {
  private readonly authService: AuthService

  constructor(authService: AuthService) {
    this.authService = authService
  }

  async signUp(request: NextRequest) {
    const { email, password, name } = await request.json()
    const errorHandler = errorResponseHandler()
    const successHandler = successResponseHandler()

    try {
      await this.authService.getUserByEmail(email, true)
    } catch (error) {
      return errorHandler(error as Error)
    }

    try {
      const passwordHash = await argon.hash(password)
      const user = await this.authService.createUser({ email, passwordHash, name })
      const auth = await generateAccessToken(user.id)      

      const data: SignedUserResponseDto = {
        user,
        auth
      }

      const { configData, createData } = generateRefreshToken(request)
      await this.authService.createRefreshToken(user.id, createData)

      const cookieStore = await cookies()

      cookieStore.set(
        configData.tokenName,
        createData.token,
        { ...configData }
      )

      return successHandler(HTTP_STATUS_CODE.CREATED, data)
    } catch (error) {
      return errorHandler(error as Error)
    }
  }

  async signIn(request: NextRequest) {
    const { email, password } = await request.json()
    const errorHandler = errorResponseHandler()
    const successHandler = successResponseHandler()
    let user: Required<GetUserResponseDto> | null = null

    try {
      user = await this.authService.getUserByEmail(email) as Required<GetUserResponseDto>
    } catch (error) {
      return errorHandler(error as Error)
    }

    try {
      const auth = await generateAccessToken(user.id)
      const userData = await validatePassword(password, user)

      const data: SignedUserResponseDto = {
        user: userData,
        auth
      }

      const { configData, createData } = generateRefreshToken(request)
      await this.authService.createRefreshToken(user.id, createData)

      const cookieStore = await cookies()

      cookieStore.set(
        configData.tokenName,
        createData.token,
        { ...configData }
      )

      return successHandler(HTTP_STATUS_CODE.CREATED, data)
    } catch (error) {
      return errorHandler(error as Error)
    }
  }

  async signOut(request: NextRequest) {
    const successHandler = successResponseHandler()
    const errorHandler = errorResponseHandler()
    const { id } = await request.json()
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(constants.REFRESH_TOKEN_COOKIE_NAME)?.value ?? ''

    try {
      await this.authService.deleteRefreshToken(id, refreshToken)
      const { configData } = generateRefreshToken(request)
      cookieStore.delete(configData.tokenName)

      return successHandler(HTTP_STATUS_CODE.NO_CONTENT)
    } catch (error) {
      return errorHandler(error as Error)
    }
  }

  async refresh(request: NextRequest) {
    const errorHandler = errorResponseHandler()
    const successHandler = successResponseHandler()
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(constants.REFRESH_TOKEN_COOKIE_NAME)?.value ?? ''
    const { ipAddress, userAgent } = getDeviceInfo(request)
    let token: RefreshToken | null = null
    let user: User | null = null
  
    if (!refreshToken) {
      const unauthorizedError = new UnauthorizedError(
        Error(constants.INVALID_OR_EXISTENT_REFRESH_TOKEN_MESSAGE)
      )
      return errorHandler(unauthorizedError)
    }
    
    try {
      token = await this.authService.getRefreshToken(refreshToken, { ipAddress, userAgent })
    } catch (error) {
      return errorHandler(error as Error)
    }
  
    try {
      user = await this.authService.getUserById(token.userId, true) as Required<GetUserResponseDto>
    } catch (error) {
      return errorHandler(error as Error)
    }
  
    const auth = await generateAccessToken(user.id)
    const data: SignedUserResponseDto = {
      user: {
        email: user.email,
        name: user.name,
        id: user.id,
      },
      auth
    }

    try {
      const { configData, createData } = generateRefreshToken(request)
      await this.authService.createRefreshToken(user.id, createData)
  
      cookieStore.set(
        configData.tokenName,
        createData.token,
        { ...configData }
      )
    } catch (error) {
      return errorHandler(error as Error)
    }
  
    return successHandler(HTTP_STATUS_CODE.SUCCESS, data)
  }

  async forgotPassword(request: NextRequest) {
    const successHandler = successResponseHandler()
    const errorHandler = errorResponseHandler()
    const { email } = await request.json()
    let user: GetUserResponseDto
  
    try {
      user = await this.authService.getUserByEmail(email) as Required<GetUserResponseDto>
    } catch (error) {
      return errorHandler(error as Error)
    }
  
    try {
      const token = await this.authService.createPasswordResetToken(user.id)
      await this.authService.sendResetPasswordEmail(email, token)  
      return successHandler(HTTP_STATUS_CODE.SUCCESS, constants.RESET_PASSWORD_INSTRUCTIONS_MESSAGE)
    } catch (error) {
      return errorHandler(error as Error)
    }
  }

  async resetPassword(request: NextRequest) {
    const successHandler = successResponseHandler()
    const errorHandler = errorResponseHandler()
    const { token, password } = await request.json()
  
    try {
      const passwordHash = await argon.hash(password)
      const reset = await this.authService.getPasswordResetToken(token)
      await this.authService.updateUserPassword(reset.userId, passwordHash)
      await this.authService.invalidatePasswordResetToken(reset.id)
  
      return successHandler(HTTP_STATUS_CODE.SUCCESS, constants.RESET_PASSWORD_SUCCESS_MESSAGE)
    } catch (error) {
      return errorHandler(error as Error)
    }
  }

  async me(request: NextRequest) {
    const successHandler = successResponseHandler()
    const errorHandler = errorResponseHandler()
    const { id } = await request.json()
  
    try {
      const user = await this.authService.getUserById(id)
      const auth = await generateAccessToken(user.id)
  
      const data: SignedUserResponseDto = {
        user,
        auth
      }
  
      return successHandler(HTTP_STATUS_CODE.SUCCESS, data)
    } catch (error) {
      return errorHandler(error as Error)
    }
  }
}

import { randomBytes, randomUUID } from "node:crypto";
import { Resend } from "resend";
import * as constants from "../../shared/constants";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ServerError,
  UnauthorizedError
} from "../../shared/errors";
import type { CreateUserDto, GetUserResponseDto } from "./auth.dto";
import { supabase } from "../../shared/config/supabase";
import type {
  CreateRefreshTokenData,
  DeviceInfo,
  PasswordResetToken,
  RefreshToken,
  User,
} from "./auth.types";

export class AuthService {
  async createUser(props: CreateUserDto) {
    const { email, passwordHash, name = '' } = props
    const id = randomUUID()
    const atIndex = email.indexOf('@')
    const placeholderName = email.slice(0, atIndex)

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          name: name ?? placeholderName,
          passwordHash,
          id
        })
        .select("*")
        .overrideTypes<User[], { merge: false }>();

      if (error) {
        throw new ServerError(error)
      }

      console.log('createUser', { data })

      const user: GetUserResponseDto = {
        email,
        name: name ?? placeholderName,
        id
      }
  
      return user
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }

  async getUserByEmail(
    email: string,
    validateEquality: boolean = false
  ): Promise<Required<GetUserResponseDto> | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select("*")
        .eq('email', email)
        .single()

      if (data && validateEquality) {
        throw new ConflictError(
          Error(constants.EMAIL_ALREADY_IN_USE_MESSAGE)
        )
      }

      if (!data && validateEquality) {
        return null
      }

      if (!data) {
        throw new NotFoundError(
          Error(constants.USER_NOT_FOUND_MESSAGE)
        )
      }

      if (error) {
        throw new ServerError(error)
      }

      const user: Required<GetUserResponseDto> = {
        email: data.email,
        name: data.name,
        id: data.id,
        passwordHash: data.passwordHash
      }

      return user
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }

  async getUserById(
    id: string,
    withPasswordHash: boolean = false
  ): Promise<GetUserResponseDto> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select("*")
        .eq('id', id)
        .single()

      if (!data) {
        throw new NotFoundError(
          Error(constants.USER_NOT_FOUND_MESSAGE)
        )
      }

      if (error) {
        throw new ServerError(error)
      }

      const user: GetUserResponseDto = {
        email: data.email,
        name: data.name,
        id: data.id,
        passwordHash: withPasswordHash ? data.passwordHash : undefined
      }

      return user
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ passwordHash })
        .eq('id', userId)
        .select("*")
        .single()

      if (error) {
        throw new ServerError(error)
      }

      console.log('updateUserPassword', { data })
      return
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }

  async createRefreshToken(
    userId: string,
    tokenData: CreateRefreshTokenData
  ) {
    try {
      const { data, error } = await supabase
        .from('refreshToken')
        .insert({
          ...tokenData,
          userId,
        })
        .select("*")
        .single()

      if (error) {
        throw new ServerError(error)
      }

      console.log('createRefreshToken', { data })

      return data
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }

  async deleteRefreshToken(userId: string, refreshToken: string) {
    try {
      const { data, error } = await supabase
        .from('refreshToken')
        .delete()
        .eq('userId', userId)
        .eq('token', refreshToken)
        .select("*")
        .single()

      if (error) {
        throw new ServerError(error)
      }

      console.log('deleteRefreshToken', { data })

      return
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }

  async getRefreshToken(refreshToken: string, deviceInfo: DeviceInfo): Promise<RefreshToken> {
    const { ipAddress, userAgent } = deviceInfo
    
    try {
      const { data, error } = await supabase
        .from('refreshToken')
        .select("*")
        .eq('token', refreshToken)
        .single()
      
      if (!data || data.revokedAt || data.expiresAt < new Date()) {
        throw new UnauthorizedError(
          Error(constants.INVALID_OR_EXPIRED_REFRESH_TOKEN_MESSAGE)
        )
      }
    
      if (data.ipAddress !== ipAddress || data.userAgent !== userAgent) {
        throw new ForbiddenError(
          Error(constants.FORBIDDEN_DEVICE_ACCESS_MESSAGE)
        )
      }

      if (error) {
        throw new ServerError(error)
      }

      console.log('getRefreshToken', { data })

      return data
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }

  async createPasswordResetToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex')
    
    try {
      const { data, error } = await supabase
        .from('passwordResetToken')
        .insert({
          expiresAt: new Date(Date.now() + constants.AVG_AGE),
          token,
          userId
        })
        .select("*")
        .single()

      if (error) {
        throw new ServerError(error)
      }

      console.log('createPasswordResetToken', { data })
      return token
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken> {
    try {
      const { data, error } = await supabase
        .from('passwordResetToken')
        .select("*")
        .eq('token', token)
        .single()

      if (error) {
        throw new ServerError(error)
      }

      if (!data || data.expiresAt < new Date() || data.usedAt) {
        throw new UnauthorizedError(
          Error(constants.INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_MESSAGE)
        )
      }

      return data
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }

  async invalidatePasswordResetToken(id: number): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('passwordResetToken')
        .update({ usedAt: new Date() })
        .eq('id', id)
        .select("*")
        .single()

      if (error) {
        throw new ServerError(error)
      }

      console.log('invalidatePasswordResetToken', { data })

      return
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    const subject = 'Reset your password'
    const text = `Click here to reset your password: ${resetPasswordUrl}`
    const html = `<strong>
        <a target="_blank" href="${resetPasswordUrl}">
          ${text}
        </a>
      </strong>`

    try {
      const resend = new Resend(process.env.RESEND_KEY);
      await resend.emails.send({
        from: `${process.env.EMAIL_SUBJECT} <${process.env.EMAIL_SENDER}>`,
        to: [email],
        subject,
        html,
      });
    } catch (error) {
      throw new ServerError(error as Error)
    }
  }
}

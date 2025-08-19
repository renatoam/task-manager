import { jwtVerify } from "jose"
import * as constants from "../constants"
import { ServerError, UnauthorizedError } from "../errors"
import { errorResponseHandler } from "../../server/http/httpErrorResponseHandler"
import { NextRequest, NextResponse } from "next/server"

export const authenticate = async (
  request: NextRequest,
) => {
  const errorHandler = errorResponseHandler()
  const authorization = request.headers.get('Authorization')
  const token = authorization?.split(' ')[1] ?? ''

  if (!authorization || !token || !authorization.startsWith('Bearer ')) {
    const unauthorizedError = new UnauthorizedError(
      Error(constants.INVALID_OR_MISSING_TOKEN_MESSAGE)
    )
    return errorHandler(unauthorizedError)
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  
  try {
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.sub

    if (!userId) {
      const unauthorizedError = new UnauthorizedError(
        Error(constants.INVALID_OR_MISSING_TOKEN_MESSAGE)
      )
      return errorHandler(unauthorizedError)
    }

    return NextResponse.next()
  } catch (error) {
    const serverError = new ServerError(error as Error)
    return errorHandler(serverError)
  }
}

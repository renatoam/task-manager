import { NextResponse } from "next/server"
import type { ErrorBody } from "../../shared/errors"
import {
  badRequest,
  conflict,
  notFound,
  serverError,
  serviceUnavailable
} from "./httpResponseHandlers"

export function errorResponseHandler(): (error: Error) => NextResponse<ErrorBody> {
  return (error: Error): NextResponse<ErrorBody> => {
    const badRequestResponse = badRequest(error)
    const conflictError = conflict(error)
    const notFoundErrorResponse = notFound(error)
    const serverErrorResponse = serverError(error)
    const databaseErrorResponse = serviceUnavailable(error)

    switch (error.name) {
      case 'ClientError':
        console.error(`${error.name}: ${error.message}`)
        return NextResponse
          .json(badRequestResponse.body, { status: badRequestResponse.statusCode })
      
      case 'ConflictError':
        console.error(`${error.name}: ${error.message}`)
        return NextResponse
          .json(conflictError.body, { status: conflictError.statusCode })
      
      case 'NotFoundError':
        console.error(`${error.name}: ${error.message}`)
        return NextResponse
          .json(notFoundErrorResponse.body, { status: notFoundErrorResponse.statusCode })
      
      case 'DatabaseError':
        console.error(`${error.name}: ${error.message}`)
        return NextResponse
          .json(databaseErrorResponse.body, { status: databaseErrorResponse.statusCode })
      
      case 'QueryError':
      default:
        console.error(`${error.name}: ${error.message}`)
        return NextResponse
          .json(serverErrorResponse.body, { status: serverErrorResponse.statusCode })
    }
  }
}

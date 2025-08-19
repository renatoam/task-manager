import { NextResponse } from "next/server"
import { created, HTTP_STATUS_CODE, noContent, ok } from "./httpResponseHandlers"

export function successResponseHandler<T>(): (code: number, data?: T) => NextResponse<T | unknown> {
  return (code: number, data?: T): NextResponse<T | unknown> => {
    const successResponse = ok(data)
    const createdResponse = created(data)
    const noContentResponse = noContent()

    switch (code) {
      case HTTP_STATUS_CODE.SUCCESS:
        return NextResponse
          .json(successResponse.body, { status: successResponse.statusCode })
      case HTTP_STATUS_CODE.CREATED:
        return NextResponse
          .json(createdResponse.body, { status: createdResponse.statusCode })
      case HTTP_STATUS_CODE.NO_CONTENT:
        return NextResponse
          .json(noContentResponse.body, { status: noContentResponse.statusCode })
      default:
        return NextResponse
          .json(data, { status: code })
    }
  }
}

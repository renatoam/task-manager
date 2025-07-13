import { z } from "zod"
import * as constants from "../constants"
import { ClientError, getZodErrorMessage } from "../errors"
import { errorResponseHandler } from "../../server/http/httpErrorResponseHandler"
import { NextRequest } from "next/server"

export const forgotSchema = z.object({
  email: z
    .string()
    .email(constants.INVALID_EMAIL_MESSAGE)
    .trim()
})

export const forgotBodyValidation = async (
  request: NextRequest,
) => {
  const errorHandler = errorResponseHandler()
  const parseResult = forgotSchema.safeParse(await request.json())

  if (!parseResult.success) {
    const errorMessage = getZodErrorMessage(parseResult.error.issues)
    const clientError = new ClientError(
      Error(errorMessage)
    )
    return errorHandler(clientError)
  }
}

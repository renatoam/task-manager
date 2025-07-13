import { z } from "zod"
import * as constants from "../constants"
import { ClientError, getZodErrorMessage } from "../errors"
import { errorResponseHandler } from "../../server/http/httpErrorResponseHandler"
import { NextRequest } from "next/server";

export const resetSchema = z.object({
  token:
    z.string()
    .min(64, constants.RESET_TOKEN_MIN_LENGTH_MESSAGE),
  password: z
    .string()
    .min(8, constants.PASSWORD_MIN_LENGTH_MESSAGE)
    .max(100, constants.PASSWORD_MAX_LENGTH_MESSAGE)
    .regex(/[A-Z]/, constants.PASSWORD_UPPERCASE_LETTER_MESSAGE)
    .regex(/[a-z]/, constants.PASSWORD_LOWERCASE_LETTER_MESSAGE)
    .regex(/\d/, constants.PASSWORD_NUMBER_MESSAGE)
    .regex(/[^A-Za-z0-9]/, constants.PASSWORD_SPECIAL_CHARACTER_MESSAGE),
  confirmPassword: z
    .string()
    .min(8, constants.CONFIRM_PASSWORD_MIN_LENGTH_MESSAGE),
}).refine((data) => data.password === data.confirmPassword, {
  message: constants.PASSWORDS_DO_NOT_MATCH_MESSAGE,
  path: [constants.CONFIRM_PASSWORD_PATH],
});

export const resetBodyValidation = async (
  request: NextRequest,
) => {
  const errorHandler = errorResponseHandler()
  const parseResult = resetSchema.safeParse(await request.json())

  if (!parseResult.success) {
    const message = getZodErrorMessage(parseResult.error.issues)
    const clientError = new ClientError(
      Error(message)
    )
    return errorHandler(clientError)
  }
}

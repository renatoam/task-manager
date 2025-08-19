import { z } from "zod";
import * as constants from "../constants";
import { ClientError, getZodErrorMessage } from "../errors";
import { errorResponseHandler } from "../../server/http/httpErrorResponseHandler";
import { NextRequest } from "next/server";

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, constants.NAME_MIN_LENGTH_MESSAGE)
    .max(50, constants.NAME_MAX_LENGTH_MESSAGE)
    .trim()
    .optional(),
  email: z
    .email(constants.INVALID_EMAIL_MESSAGE)
    .max(100, constants.EMAIL_MAX_LENGTH_MESSAGE)
    .trim(),
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

export const signUpBodyValidation = async (
  request: NextRequest,
) => {
  const errorHandler = errorResponseHandler()
  const parseResult = signUpSchema.safeParse(await request.json());

  if (!parseResult.success) {
    const errorMessage = getZodErrorMessage(parseResult.error.issues)
    const badRequestError = new ClientError(Error(errorMessage))
    return errorHandler(badRequestError)
  }
}

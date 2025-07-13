import { z } from "zod";
import * as constants from "../constants";
import { ClientError, getZodErrorMessage } from "../errors";
import { errorResponseHandler } from "../../server/http/httpErrorResponseHandler";
import type { NextRequest } from "next/server";

export const signInSchema = z.object({
  email: z
    .email(constants.INVALID_EMAIL_MESSAGE)
    .trim(),
  password: z
    .string()
})

export const signInBodyValidation = async (
  request: NextRequest,
) => {
  const errorHandler = errorResponseHandler()
  const parseResult = signInSchema.safeParse(await request.json());

  if (!parseResult.success) {
    const errorMessage = getZodErrorMessage(parseResult.error.issues)
    const badRequestError = new ClientError(Error(errorMessage))
    return errorHandler(badRequestError)
  }
}

import { z } from "zod"
import { ClientError, getZodErrorMessage } from "../errors"
import { errorResponseHandler } from "../../server/http/httpErrorResponseHandler"
import { NextRequest } from "next/server"

const schema = z.object({
  id: z.uuid()
})

export async function validateIncomingId(
  request: NextRequest,
) {
  const errorHandler = errorResponseHandler()
  const parseResult = schema.safeParse(await request.json())

  if (!parseResult.success) {
    const errorMessage = getZodErrorMessage(parseResult.error.issues)
    const badRequestError = new ClientError(Error(errorMessage))
    return errorHandler(badRequestError)
  }
}

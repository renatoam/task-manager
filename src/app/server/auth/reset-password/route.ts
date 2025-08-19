import { NextRequest } from "next/server";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { resetBodyValidation } from "../../../shared/validation/resetBodyValidation";

export async function POST(request: NextRequest) {
  await resetBodyValidation(request)

  const authService = new AuthService()
  const authController = new AuthController(authService)

  return authController.resetPassword(request)
}

import { NextRequest } from "next/server";
import { signInBodyValidation } from "../../../shared/validation/signInBodyValidation";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";

export async function POST(request: NextRequest) {
  await signInBodyValidation(request)

  const authService = new AuthService()
  const authController = new AuthController(authService)

  return authController.signIn(request)
}

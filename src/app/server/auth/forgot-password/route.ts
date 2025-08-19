import { NextRequest } from "next/server";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { forgotBodyValidation } from "../../../shared/validation/forgotBodyValidation";

export async function POST(request: NextRequest) {
  await forgotBodyValidation(request)

  const authService = new AuthService()
  const authController = new AuthController(authService)

  return authController.forgotPassword(request)
}

import { NextRequest } from "next/server";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";

export async function GET(request: NextRequest) {
  const authService = new AuthService()
  const authController = new AuthController(authService)

  return authController.me(request)
}

import { RequestHandler } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "../modules/users/users.types";
import { AppError } from "../utils/app-error";
import { env } from "../config/env";

const tokenClaims = z.object({
  sub: z.uuid(),
  email: z.email(),
  role: z.enum(USER_ROLES),
});

export const authenticate: RequestHandler = (req, _res, next) => {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    throw AppError.unauthorized("Bearer token is missing");
  }

  let claim: z.infer<typeof tokenClaims>;
  try {
    claim = tokenClaims.parse(
      jwt.verify(token, env.JWT_SECRET, {
        algorithms: ["HS256"],
      }),
    );
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
  req.user = {
    id: claim.sub,
    email: claim.email,
    role: claim.role,
  };
  next();
};

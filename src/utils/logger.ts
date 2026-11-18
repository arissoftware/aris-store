import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.NODE_ENV === "development" ? "info" : "error",
  redact: ["req.headers.authorization", "req.headers.cookie"],
});

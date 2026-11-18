import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";

export const protect = (role: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role !== role) throw AppError.forbidden();
    next();
  };
};

import { Request, Response } from "express";
import {
  loginSchema,
  registerUserSchema,
  reqEmail,
  updateUserSchema,
  userId,
} from "./auth.schemas";
import { authService } from "./auth.service";
import { AppError } from "../../utils/app-error";
import { UserRole } from "../users/users.types";

export const authController = {
  async register(req: Request, res: Response) {
    const input = registerUserSchema.parse(req.body);
    await authService.register(input);

    res.status(201).json({
      status: "Success",
      message: "Registration successfull",
    });
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const user = await authService.login(input);

    res.status(200).json({
      status: "Success",
      message: "Login successfull",
      data: user,
    });
  },

  async update(req: Request, res: Response) {
    const userId = req.user?.id;
    const email = req.user?.email;

    if (!userId || !email)
      throw AppError.unauthorized(
        "You are not authorized to perform this operation.",
      );

    const input = updateUserSchema.parse(req.body);

    const user = await authService.update(userId, email, input);

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });
  },

  async delete(req: Request, res: Response) {
    const userId = req.user?.id;
    const email = req.user?.email;
    if (!userId || !email)
      throw AppError.unauthorized(
        "You are not authorized to perform this operation.",
      );

    const user = await authService.delete(userId, email);
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      data: user,
    });
  },

  async getUser(req: Request, res: Response) {
    const role = req.user?.role;

    let id = userId.parse(req.params.id);

    if (!id) throw AppError.notFound("Please enter the ID of the user");

    if (!role) throw AppError.forbidden();

    const user = await authService.getOneUser(id);

    res.status(200).json({
      status: "Success",
      message: "User retrieved successfully",
      data: user,
    });
  },

  async getAllUsers(req: Request, res: Response) {
    const role = req.user?.role;
    if (!role) throw AppError.forbidden();

    const users = await authService.getAllUsers();

    res.status(200).json({
      status: "Success",
      message: "Users retrieved successfully",
      data: users,
    });
  },

  async profile(req: Request, res: Response) {
    const id = userId.parse(req.user?.id);
    const email = reqEmail.parse(req.user?.email);
    if (!id || !email)
      throw AppError.unauthorized("Please login to visit your profile");

    const user = await authService.profile(id, email);

    res.status(200).json({
      status: "Success",
      message: `Welcome back ${user.fullName}`,
      data: user,
    });
  },
};

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  LoginInput,
  RegisterUserInput,
  UpdateUserInput,
  UserId,
} from "./auth.schemas.js";
import { usersRepository } from "../users/users.repository";
import { AppError } from "../../utils/app-error.js";
import { isUniqueViolation } from "../../config/db/errors.js";
import { env } from "../../config/env.js";
import { UserRole } from "../users/users.types.js";

const BCRYPT_ROUNDS = 12;

export const authService = {
  async register({ fullName, email, password }: RegisterUserInput) {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    try {
      return await usersRepository.create(fullName, email, passwordHash);
    } catch (error) {
      if (isUniqueViolation(error))
        throw AppError.unauthorized("Email already in use.");
      throw error;
    }
  },

  async login({ email, password }: LoginInput) {
    const user = await usersRepository.findByEmail(email);
    const isPasswordMatch = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !isPasswordMatch) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const accessToken = jwt.sign(
      { email: user.email, role: user.role },
      env.JWT_SECRET,
      {
        algorithm: "HS256",
        subject: user.id,
        expiresIn: env.JWT_EXPIRES_IN_SECONDS,
      },
    );

    return {
      status: "success",
      message: "Login successfull",
      token: accessToken,
      tokenType: "Bearer",
      expiresIn: env.JWT_EXPIRES_IN_SECONDS,
    };
  },

  async update(userId: string, email: string, { fullName }: UpdateUserInput) {
    const user = await usersRepository.update(userId, email, fullName);

    if (!user) {
      throw AppError.unauthorized(
        "You are not authorized to perform this operation.",
      );
    }

    return user;
  },

  async delete(userId: string, email: string) {
    const user = await usersRepository.deleteUser(userId, email);

    if (!user) {
      throw AppError.unauthorized(
        "You are not authorized to perform this operation.",
      );
    }
    return user;
  },

  async getOneUser(id: UserId) {
    const user = await usersRepository.selectOneUser(id);
    if (!user) throw AppError.notFound("User not found");

    return user;
  },

  async getAllUsers() {
    const users = await usersRepository.selectAllUsers();

    if (users.length <= 0) throw AppError.notFound("No users are found");
    return users;
  },

  async profile(id: UserId, email: string) {
    const user = await usersRepository.findByIdAndEmail(id, email);
    if (!user) throw AppError.unauthorized("User not found");

    return user;
  },
};

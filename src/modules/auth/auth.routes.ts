import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate } from "../../middlewares/authenticate";
import { protect } from "../../middlewares/adminProtected";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/profile", authenticate, authController.profile);
authRouter.get("/", authenticate, protect("ADMIN"), authController.getAllUsers);
authRouter.get("/:id", authenticate, protect("ADMIN"), authController.getUser);

authRouter.patch("/update", authenticate, authController.update);
authRouter.delete("/delete", authenticate, authController.delete);

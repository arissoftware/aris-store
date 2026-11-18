import express from "express";
import cors from "cors";
import { notFound } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handler";
import { authRouter } from "./modules/auth/auth.routes";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  app.use("/api/v1/auth/users", authRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

import express from "express";

import AuthController from "../controllers/authControllers.js";

import validateBody from "../helpers/validateBody.js";
import { loginSchema, registerSchema } from "../schemas/usersSchemas.js";
import authenticate from "../helpers/authenticate.js";
import { updateSubscriptionSchema } from "../schemas/contactsSchemas.js";
import upload from "../helpers/upload.js"; // щоб цю аватарку взяти і зберегти в тимчасову папку temp

const authRouter = express.Router();
const jsonParser = express.json();

// sign up
authRouter.post(
  "/register",
  jsonParser,
  validateBody(registerSchema),
  AuthController.register
);
// маршрут по якому за допомогою verificationToken будемо шукати користувача http://localhost:4000/api/users/verify/1MuVU8Jg4fOwQel0MvvNs
authRouter.get("/verify/:verificationToken", AuthController.verifyEmail);

// маршрут в якому в post запиті буде приходити email на який знову треба вислати лист із підтвердженням http://localhost:4000/api/users/verify
authRouter.post(
  "/verify",
  jsonParser,
  validateBody(emailSchema),
  AuthController.resendVerifyEmail
);

// sign in;
authRouter.post(
  "/login",
  jsonParser,
  validateBody(loginSchema),
  AuthController.login
);
// current
authRouter.get("/current", authenticate, AuthController.getCurrent);

// logout
authRouter.post("/logout", authenticate, AuthController.logout);

// patch
authRouter.patch(
  "/",
  authenticate,
  jsonParser,
  validateBody(updateSubscriptionSchema),
  AuthController.updateSubscription
);
// запит на зміну автарки могла зробити тільки та людина яка залогінилась(мідлвара authenticate)
// створюємо маршрут за яким людина може змінити аватарку метод patch
authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"), // щоб зберегти нову аватарку в тимчасову папку
  AuthController.updateAvatar
);

// http://localhost:4000/api/users/avatars
export default authRouter;

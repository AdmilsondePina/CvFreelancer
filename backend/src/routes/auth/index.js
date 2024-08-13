import express from "express";
import {
  forgotPasswordRouteHandler,
  loginRouteHandler,
  registerRouteHandler,
  resetPasswordRouteHandler,
} from "../../services/auth";
import { findUserByEmail } from "../../schemas/user.schema.js"; // Exemplo de importação da função para acessar o PostgreSQL

const router = express.Router();

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body.data.attributes;
  
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  // Verifique a senha (você precisa implementar a lógica de verificação)
  const isPasswordValid = password === user.password; // Você deve usar bcrypt ou similar
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  // Continue com a lógica de autenticação, como gerar um token JWT

  await loginRouteHandler(req, res, email, password);
});

router.post("/logout", (req, res) => {
  return res.sendStatus(204);
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body.data.attributes;
  await registerRouteHandler(req, res, name, email, password);
});

router.post("/password-forgot", async (req, res) => {
  const { email } = req.body.data.attributes;
  await forgotPasswordRouteHandler(req, res, email);
});

router.post("/password-reset", async (req, res) => {
  await resetPasswordRouteHandler(req, res);
});

export default router;

